// app/api/courier/book/route.js
import connectDB from '@/config/database';
import Order from '@/models/Order';
import { getSessionUser } from '@/utils/getSessionUser';
import { CourierServiceManager } from '@/utils/courierServices';

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
    const { orderId, provider, service, deliveryAddress, collectionAddress } = body;

    const order = await Order.findById(orderId);
    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is seller
    if (order.seller.toString() !== sessionUser.userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Only seller can book courier' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const courierManager = new CourierServiceManager();

    const shipmentData = {
      orderNumber: order.orderNumber,
      collectionAddress,
      deliveryAddress,
      parcels: body.parcels || [{
        description: `Order ${order.orderNumber}`,
        weight: 1,
        reference: order.orderNumber,
      }],
      declaredValue: order.total,
      collectionNotes: body.collectionNotes,
      deliveryNotes: body.deliveryNotes,
    };

    const shipment = await courierManager.createShipment(
      provider,
      shipmentData,
      service
    );

    // Update order with courier info
    order.courierProvider = provider;
    order.trackingNumber = shipment.tracking_number || shipment.label_id;
    order.courierReference = shipment.reference;
    order.status = 'shipped';
    order.shippedAt = new Date();
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(),
      note: `Shipped via ${provider}`,
    });

    await order.save();

    return new Response(
      JSON.stringify({ 
        success: true,
        order,
        shipment 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Courier booking error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

