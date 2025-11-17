// app/api/checkout/route.js
import connectDB from '@/config/database';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { calculateShipping, estimateDelivery, validateShippingAddress } from '@/utils/shipping';
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
    const { shippingAddress, shippingMethod, paymentMethod } = body;

    // Validate shipping address
    const addressValidation = validateShippingAddress(shippingAddress);
    if (!addressValidation.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid shipping address', details: addressValidation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get cart
    const cart = await Cart.findOne({ user: sessionUser.userId })
      .populate('items.product', 'title images price stock ownerName owner deliveryOptions');

    if (!cart || cart.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify stock availability
    for (const item of cart.items) {
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

    // Calculate shipping
    const shippingCost = calculateShipping(
      cart.items.map(item => ({
        ...item,
        weight: 0.5, // Default weight, you can add weight field to products
      })),
      shippingAddress,
      shippingMethod
    );

    // Calculate totals
    const subtotal = cart.subtotal;
    const tax = cart.tax;
    const total = subtotal + shippingCost + tax;

    // Get user details
    const user = await User.findById(sessionUser.userId);

    // Create order
    const order = await Order.create({
      user: sessionUser.userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        seller: item.product.owner,
        quantity: item.quantity,
        price: item.price,
        productSnapshot: item.productSnapshot,
      })),
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress,
      shippingMethod,
      estimatedDelivery: estimateDelivery(shippingMethod, 'Johannesburg', shippingAddress.city),
      paymentMethod,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order created',
      }],
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    await Cart.findByIdAndUpdate(cart._id, { items: [] });

    // If PayFast payment, generate payment URL
    let paymentUrl = null;
    if (paymentMethod === 'payfast') {
      const baseUrl = process.env.NEXTAUTH_URL;
      const payfastData = createPayFastPayment(
        {
          ...order.toObject(),
          user: { email: user.email },
        },
        `${baseUrl}/orders/${order._id}/success`,
        `${baseUrl}/orders/${order._id}/cancel`,
        `${baseUrl}/api/payment/payfast/notify`
      );

      paymentUrl = payfastData.url;
      
      // Store PayFast data in session or database if needed
      order.paymentDetails = {
        payfastPaymentId: order.orderNumber,
      };
      await order.save();
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
        paymentUrl,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process checkout' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}