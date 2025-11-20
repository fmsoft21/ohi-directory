// app/api/courier/pudo-lockers/route.js
import { PUDOLockerService } from '@/utils/courierServices';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get('postalCode');
    const city = searchParams.get('city');

    if (!postalCode || !city) {
      return new Response(
        JSON.stringify({ error: 'Missing postal code or city' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pudoService = new PUDOLockerService();
    const lockers = await pudoService.findNearbyLockers(postalCode, city);

    return new Response(
      JSON.stringify({ lockers }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PUDO locker search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}