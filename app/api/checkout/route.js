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

// Helper function to send JSON responses
const jsonResponse = (data, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      } 
    }
  );
};

// GET - Get shipping methods for checkout
export async function GET(request) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser?.userId) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Johannesburg';
    const province = searchParams.get('province') || 'Gauteng';

    const cart = await Cart.findOne({ user: sessionUser.userId })
      .populate('items.product', 'deliveryOptions');

    if (!cart || cart.items.length === 0) {
      return jsonResponse({ error: 'Cart is empty' }, 400);
    }

    const destination = { city, province };
    const shippingMethods = getAvailableShippingMethods(cart.items, destination);

    return jsonResponse({ shippingMethods });

  } catch (error) {
    console.error('Checkout GET error:', error);
    return jsonResponse({ 
      error: error.message || 'Failed to fetch shipping methods',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, 500);
  }
}

// POST - Create orders from cart
export async function POST(request) {
  let mongoSession = null;

  try {
    await connectDB();
    
    const sessionUser = await getSessionUser();

    if (!sessionUser?.userId) {
      console.error('❌ Unauthorized: No user session');
      return jsonResponse({ error: 'Unauthorized - Please sign in' }, 401);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return jsonResponse({ 
        error: 'Invalid request format',
        details: 'Request body must be valid JSON'
      }, 400);
    }

    const { shippingAddress, shippingMethod, paymentMethod, customerNotes } = body;

    console.log('📦 Checkout initiated:', {
      userId: sessionUser.userId,
      shippingMethod,
      paymentMethod,
      hasAddress: !!shippingAddress
    });

    // Validate required fields
    if (!shippingAddress) {
      console.error('❌ Missing shipping address');
      return jsonResponse({ 
        error: 'Shipping address is required',
        field: 'shippingAddress'
      }, 400);
    }

    // Normalize address - handle both 'region' and 'province' field names
    const normalizedAddress = {
      fullName: shippingAddress.fullName || '',
      email: shippingAddress.email || '',
      phone: shippingAddress.phone || '',
      company: shippingAddress.company || '',
      address: shippingAddress.address || '',
      apartment: shippingAddress.apartment || '',
      city: shippingAddress.city || '',
      province: shippingAddress.province || shippingAddress.region || '',
      postalCode: shippingAddress.postalCode || shippingAddress.zipCode || '',
    };

    console.log('📍 Normalized address:', normalizedAddress);

    // Validate shipping address
    const addressValidation = validateShippingAddress(normalizedAddress);
    if (!addressValidation.valid) {
      console.error('❌ Invalid address:', addressValidation.errors);
      return jsonResponse({ 
        error: 'Invalid shipping address', 
        details: addressValidation.errors,
        field: 'shippingAddress'
      }, 400);
    }

    // Get buyer details
    const buyer = await User.findById(sessionUser.userId);
    if (!buyer) {
      console.error('❌ Buyer not found:', sessionUser.userId);
      return jsonResponse({ error: 'User not found' }, 404);
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
      console.error('❌ Cart is empty');
      return jsonResponse({ 
        error: 'Cart is empty',
        message: 'Please add items to your cart before checking out'
      }, 400);
    }

    console.log(`🛒 Cart items: ${cart.items.length}`);

    // Verify all products exist and have stock
    const validationErrors = [];
    
    console.log('🔍 Validating cart items...');
    for (const item of cart.items) {
      console.log('Checking item:', {
        itemId: item._id,
        hasProduct: !!item.product,
        productId: item.product?._id,
        productTitle: item.product?.title,
        hasOwner: !!item.product?.owner,
        ownerId: item.product?.owner?._id || item.product?.owner,
        stock: item.product?.stock,
        quantity: item.quantity
      });

      if (!item.product) {
        validationErrors.push({
          item: item._id,
          error: 'Product no longer exists'
        });
        continue;
      }
      
      if (!item.product.owner) {
        validationErrors.push({
          item: item._id,
          product: item.product.title,
          error: 'Product has no owner',
          productId: item.product._id
        });
        continue;
      }
      
      if (item.product.stock < item.quantity) {
        validationErrors.push({
          item: item._id,
          product: item.product.title,
          error: `Insufficient stock (Available: ${item.product.stock}, Requested: ${item.quantity})`
        });
      }
    }

    if (validationErrors.length > 0) {
      console.error('❌ Cart validation failed:', validationErrors);
      return jsonResponse({ 
        error: 'Cart validation failed',
        details: validationErrors,
        message: `Found ${validationErrors.length} issue(s) with cart items. Please review your cart.`
      }, 400);
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
    mongoSession = await mongoose.startSession();
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

          console.log(`💰 Order total: R${total.toFixed(2)} (subtotal: R${orderData.subtotal.toFixed(2)}, shipping: R${shippingCost.toFixed(2)}, tax: R${tax.toFixed(2)})`);

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
              zipCode: normalizedAddress.postalCode,
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
      mongoSession = null;
      
    } catch (txError) {
      if (mongoSession) {
        await mongoSession.endSession();
      }
      console.error('❌ Transaction failed:', txError);
      throw new Error(`Transaction failed: ${txError.message}`);
    }

    // Handle PayFast payment
    let paymentData = null;
    
    if (paymentMethod === 'payfast' && createdOrders.length > 0) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}`;
        
        // Create PayFast data for all orders combined
        const payfastResult = createPayFastPayment(
          createdOrders,
          `${baseUrl}/payment/success`,
          `${baseUrl}/checkout`,
          `${baseUrl}/api/payment/payfast/notify`
        );

        paymentData = {
          formData: payfastResult.data,
          formAction: payfastResult.url
        };
        
        console.log('💳 PayFast payment data generated:', {
          action: payfastResult.url,
          merchant_id: payfastResult.data.merchant_id,
          amount: payfastResult.data.amount
        });
      } catch (pfError) {
        console.error('⚠️ PayFast error (continuing anyway):', pfError);
        // Don't fail the whole order if PayFast fails
      }
    }

    console.log('🎉 Checkout complete!');

    return jsonResponse({ 
      success: true,
      orders: createdOrders.map(o => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        total: o.total,
        seller: o.seller,
        sellerName: o.sellerName,
      })),
      message: `${createdOrders.length} order(s) created successfully`,
      payment: paymentData, // Return PayFast form data with formData and formAction
    }, 201);

  } catch (error) {
    // Cleanup session if it exists
    if (mongoSession) {
      try {
        await mongoSession.endSession();
      } catch (e) {
        console.error('Failed to end session:', e);
      }
    }

    console.error('❌ Checkout error:', error);
    console.error('Stack trace:', error.stack);
    
    return jsonResponse({ 
      error: error.message || 'Failed to process checkout',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    }, 500);
  }
}