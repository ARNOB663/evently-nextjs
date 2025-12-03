import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Activity from '@/lib/models/Activity';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/activity - Get activity feed for user's friends
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const type = searchParams.get('type') || '';

    // Get user's friends
    const User = (await import('@/lib/models/User')).default;
    const currentUser = await User.findById(user.userId).select('friends');
    const friendIds = currentUser?.friends || [];

    // Build query - get activities from friends
    const query: any = {
      userId: { $in: friendIds },
    };

    if (type) {
      query.type = type;
    }

    const activities = await Activity.find(query)
      .populate('userId', 'fullName profileImage')
      .populate('relatedUser', 'fullName profileImage')
      .populate('relatedEvent', 'eventName image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments(query);

    return NextResponse.json(
      {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get activity feed' },
      { status: 500 }
    );
  }
}

