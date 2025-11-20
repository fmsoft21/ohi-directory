// app/api/courier/quote/route.js
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
    const { orderId, deliveryAddress, collectionAddress, parcels } = body;

    const courierManager = new CourierServiceManager();

    const shipment = {
      from: collectionAddress,
      to: deliveryAddress,
      parcels: parcels || [{
        description: 'General parcel',
        weight: 1,
        length: 30,
        width: 30,
        height: 30,
      }],
      declaredValue: body.declaredValue || 0,
    };

    const quotes = await courierManager.getAllQuotes(shipment);

    return new Response(
      JSON.stringify({ quotes }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Courier quote error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

