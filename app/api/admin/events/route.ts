import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/admin/events - Get all events with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth(['admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('hostId', 'fullName email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    // Get stats
    const stats = {
      total: await Event.countDocuments({}),
      open: await Event.countDocuments({ status: 'open' }),
      full: await Event.countDocuments({ status: 'full' }),
      cancelled: await Event.countDocuments({ status: 'cancelled' }),
      completed: await Event.countDocuments({ status: 'completed' }),
    };

    return NextResponse.json(
      {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get events' },
      { status: 500 }
    );
  }
}

