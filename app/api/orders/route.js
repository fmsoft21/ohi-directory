// app/api/orders/route.js
import connectDB from '@/config/database';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getSessionUser } from '@/utils/getSessionUser';

// GET - Fetch user's orders (both as buyer and seller)
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
    const type = searchParams.get('type'); // 'purchases' or 'sales'
    const status = searchParams.get('status');

    let query = {};
    
    if (type === 'purchases') {
      query.buyer = sessionUser.userId;
    } else if (type === 'sales') {
      query.seller = sessionUser.userId;
    }
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('buyer', 'storename email')
      .populate('seller', 'storename email')
      .populate('items.product', 'title images price')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Create order from cart
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
    const { shippingAddress, paymentMethod, customerNotes } = body;

    // Get user's cart
    const cart = await Cart.findOne({ user: sessionUser.userId })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Group items by seller
    const ordersBySeller = {};
    
    for (const item of cart.items) {
      const sellerId = item.product.owner.toString();
      
      if (!ordersBySeller[sellerId]) {
        ordersBySeller[sellerId] = {
          seller: sellerId,
          sellerName: item.product.ownerName,
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
          image: item.product.images?.[0],
          ownerName: item.product.ownerName,
        },
      });
      
      ordersBySeller[sellerId].subtotal += item.price * item.quantity;
    }

    // Create separate orders for each seller
    const createdOrders = [];
    
    for (const [sellerId, orderData] of Object.entries(ordersBySeller)) {
      const tax = orderData.subtotal * 0.15;
      const shipping = orderData.subtotal > 500 ? 0 : 50;
      const total = orderData.subtotal + tax + shipping;

      const order = await Order.create({
        buyer: sessionUser.userId,
        buyerEmail: body.email || sessionUser.user.email,
        seller: sellerId,
        sellerName: orderData.sellerName,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax,
        shipping,
        total,
        shippingAddress,
        paymentMethod,
        customerNotes,
        status: 'pending',
        paymentStatus: 'pending',
      });

      createdOrders.push(order);
      
      // Update product stock
      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    // Clear cart
    await Cart.findByIdAndUpdate(cart._id, { items: [] });

    return new Response(JSON.stringify({ 
      success: true,
      orders: createdOrders 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}