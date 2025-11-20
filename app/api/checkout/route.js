// app/api/checkout/route.js - FIXED VERSION
import connectDB from '@/config/database';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { calculateShipping, estimateDelivery, validateShippingAddress, getAvailableShippingMethods } from '@/utils/shipping';
import { createPayFastPayment } from '@/utils/payfast';

// GET - Get shipping methods for checkout
export async function GET(request) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser?.userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Johannesburg';
    const province = searchParams.get('province') || 'Gauteng';

    const cart = await Cart.findOne({ user: sessionUser.userId })
      .populate('items.product', 'deliveryOptions');

    if (!cart || cart.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const destination = { city, province };
    const shippingMethods = getAvailableShippingMethods(cart.items, destination);

    return new Response(
      JSON.stringify({ shippingMethods }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout GET error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Create orders from cart (FULLY FIXED)
export async function POST(request) {
  try {
    await connectDB();
    
    const sessionUser = await getSessionUser();

    if (!sessionUser?.userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { shippingAddress, shippingMethod, paymentMethod, customerNotes } = body;

    console.log('📦 Checkout initiated:', {
      userId: sessionUser.userId,
      shippingMethod,
      paymentMethod,
      hasAddress: !!shippingAddress
    });

    // Validate shipping address - handle both 'region' and 'province' field names
    const normalizedAddress = {
      ...shippingAddress,
      province: shippingAddress.province || shippingAddress.region,
    };

    const addressValidation = validateShippingAddress(normalizedAddress);
    if (!addressValidation.valid) {
      console.error('❌ Invalid address:', addressValidation.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid shipping address', 
          details: addressValidation.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get buyer details
    const buyer = await User.findById(sessionUser.userId);
    if (!buyer) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('👤 Buyer:', buyer.email);

    // Get cart with populated products
    const cart = await Cart.findOne({ user: sessionUser.userId })
      .populate({
        path: 'items.product',
        select: 'title images price stock ownerName owner deliveryOptions',
        populate: {
          path: 'owner',
          select: 'storename email'
        }
      });

    if (!cart || cart.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🛒 Cart items: ${cart.items.length}`);

    // Verify all products exist and have owners
    for (const item of cart.items) {
      if (!item.product) {
        return new Response(
          JSON.stringify({ error: 'One or more products no longer exist' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (!item.product.owner) {
        console.error('❌ Product missing owner:', item.product._id);
        return new Response(
          JSON.stringify({ 
            error: `Product "${item.product.title}" has no owner`,
            productId: item.product._id 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (item.product.stock < item.quantity) {
        return new Response(
          JSON.stringify({ 
            error: `Insufficient stock for ${item.product.title}`,
            productId: item.product._id 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Group items by seller
    const ordersBySeller = {};
    
    for (const item of cart.items) {
      const sellerId = item.product.owner._id.toString();
      const sellerName = item.product.owner.storename || item.product.ownerName || 'Unknown Seller';
      
      if (!ordersBySeller[sellerId]) {
        ordersBySeller[sellerId] = {
          seller: sellerId,
          sellerName: sellerName,
          items: [],
          subtotal: 0,
        };
      }
      
      ordersBySeller[sellerId].items.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        productSnapshot: {
          title: item.product.title,
          image: item.product.images?.[0] || '/image.png',
          ownerName: sellerName,
        },
      });
      
      ordersBySeller[sellerId].subtotal += item.price * item.quantity;
    }

    console.log(`📊 Orders grouped by ${Object.keys(ordersBySeller).length} seller(s)`);

    // Create separate orders for each seller using a transaction
    const mongoSession = await mongoose.startSession();
    const createdOrders = [];
    
    try {
      await mongoSession.withTransaction(async () => {
        for (const [sellerId, orderData] of Object.entries(ordersBySeller)) {
          console.log(`📝 Creating order for seller: ${orderData.sellerName}`);
          
          // Calculate costs for this seller's order
          const shippingCost = calculateShipping(
            orderData.items.map(item => ({
              ...item,
              weight: 0.5, // Default weight
            })),
            normalizedAddress,
            shippingMethod || 'standard'
          );

          const tax = orderData.subtotal * 0.15; // 15% VAT
          const total = orderData.subtotal + shippingCost + tax;

          console.log(`💰 Order total: R${total.toFixed(2)} (subtotal: R${orderData.subtotal}, shipping: R${shippingCost}, tax: R${tax})`);

          // Create order with ALL required fields
          const orderDoc = {
            // REQUIRED: Buyer information
            buyer: sessionUser.userId,
            buyerEmail: normalizedAddress.email || buyer.email,
            
            // REQUIRED: Seller information
            seller: sellerId,
            sellerName: orderData.sellerName,
            
            // Items
            items: orderData.items,
            
            // Pricing (REQUIRED)
            subtotal: orderData.subtotal,
            shipping: shippingCost,
            tax: tax,
            total: total,
            
            // Shipping address (REQUIRED)
            shippingAddress: {
              fullName: normalizedAddress.fullName || normalizedAddress.company || buyer.storename || 'Customer',
              phone: normalizedAddress.phone || '',
              address: normalizedAddress.address,
              apartment: normalizedAddress.apartment || '',
              city: normalizedAddress.city,
              province: normalizedAddress.province,
              zipCode: normalizedAddress.postalCode || normalizedAddress.zipCode,
              country: 'South Africa',
            },
            
            // Shipping method
            shippingMethod: shippingMethod || 'standard',
            estimatedDelivery: estimateDelivery(
              shippingMethod || 'standard', 
              'Johannesburg', 
              normalizedAddress.city
            ),
            
            // Payment (REQUIRED)
            paymentMethod: paymentMethod || 'payfast',
            paymentStatus: 'pending',
            
            // Notes
            customerNotes: customerNotes || '',
            
            // Status
            status: 'pending',
            
            // Status history
            statusHistory: [{
              status: 'pending',
              timestamp: new Date(),
              note: 'Order created',
            }],
          };

          // Let the model generate orderNumber via pre-save hook
          const order = new Order(orderDoc);
          await order.save({ session: mongoSession });

          console.log(`✅ Order created: ${order.orderNumber}`);
          
          createdOrders.push(order);
          
          // Reduce stock for each item
          for (const item of orderData.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: -item.quantity } },
              { session: mongoSession }
            );
          }
        }

        // Clear cart after all orders are successfully created
        await Cart.findByIdAndUpdate(
          cart._id, 
          { items: [] },
          { session: mongoSession }
        );

        console.log('✅ Cart cleared');
      });

      await mongoSession.endSession();
      
    } catch (txError) {
      await mongoSession.endSession();
      console.error('❌ Transaction failed:', txError);
      throw txError;
    }

    // Handle PayFast payment for first order (or combine if needed)
    let paymentUrl = null;
    if (paymentMethod === 'payfast' && createdOrders.length > 0) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL;
        const firstOrder = createdOrders[0];
        
        const payfastData = createPayFastPayment(
          {
            ...firstOrder.toObject(),
            user: { email: buyer.email },
          },
          `${baseUrl}/dashboard/purchases/${firstOrder._id}`,
          `${baseUrl}/checkout`,
          `${baseUrl}/api/payment/payfast/notify`
        );

        paymentUrl = payfastData.url;
        
        // Store PayFast data
        firstOrder.paymentDetails = {
          payfastPaymentId: firstOrder.orderNumber,
        };
        await firstOrder.save();
        
        console.log('💳 PayFast payment URL generated');
      } catch (pfError) {
        console.error('⚠️ PayFast error (continuing anyway):', pfError);
        // Don't fail the whole order if PayFast fails
      }
    }

    console.log('🎉 Checkout complete!');

    return new Response(
      JSON.stringify({ 
        success: true,
        orders: createdOrders.map(o => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          total: o.total,
          seller: o.seller,
          sellerName: o.sellerName,
        })),
        message: `${createdOrders.length} order(s) created successfully`,
        paymentUrl,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process checkout',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}