import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/users/[id]/mutual - Get mutual connections and events
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(user.userId).select('friends'),
      User.findById(userId).select('friends'),
    ]);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate mutual friends
    const mutualFriendIds = currentUser.friends.filter((friendId) =>
      targetUser.friends.includes(friendId)
    );

    const mutualFriends = await User.find({ _id: { $in: mutualFriendIds } })
      .select('fullName profileImage')
      .limit(10);

    // Calculate mutual events (events both users attended or hosted)
    const currentUserEvents = await Event.find({
      $or: [
        { hostId: user.userId },
        { participants: user.userId },
      ],
    }).select('_id');

    const targetUserEvents = await Event.find({
      $or: [
        { hostId: userId },
        { participants: userId },
      ],
    }).select('_id');

    const currentEventIds = currentUserEvents.map((e) => e._id.toString());
    const targetEventIds = targetUserEvents.map((e) => e._id.toString());
    const mutualEventIds = currentEventIds.filter((id) => targetEventIds.includes(id));

    const mutualEvents = await Event.find({ _id: { $in: mutualEventIds } })
      .populate('hostId', 'fullName profileImage')
      .select('eventName eventType date location image')
      .sort({ date: -1 })
      .limit(10);

    return NextResponse.json(
      {
        mutualFriends: {
          count: mutualFriendIds.length,
          users: mutualFriends,
        },
        mutualEvents: {
          count: mutualEventIds.length,
          events: mutualEvents,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get mutual connections error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get mutual connections' },
      { status: 500 }
    );
  }
}

