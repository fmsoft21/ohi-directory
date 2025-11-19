// app/api/admin/products/route.js
import connectDB from '@/config/database';
import Product from '@/models/Product';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import mongoose from 'mongoose';

// GET - List all products with filters 
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

    // Validate that userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionUser.userId)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid user ID' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await User.findById(sessionUser.userId);
    if (!user?.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = {};

    // Only apply status filter if it's explicitly set and not 'all'
    if (status && status !== 'all') {
      if (status === 'flagged') {
        query.flagged = true;
      } else if (status === 'active') {
        query.status = { $in: ['active', undefined, null] };
        query.flagged = { $ne: true };
      } else if (status === 'suspended') {
        query.status = 'suspended';
      } else if (status === 'lowstock') {
        query.stock = { $lt: 10 };
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('owner', 'storename email image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return new Response(
      JSON.stringify({
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin products GET error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

