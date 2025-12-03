import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/friends/cancel - Cancel sent friend request
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Verify the request is from the current user
    if (friendRequest.from.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Friend request is not pending' }, { status: 400 });
    }

    // Update friend request status
    friendRequest.status = 'cancelled';
    await friendRequest.save();

    const fromUserId = friendRequest.from.toString();
    const toUserId = friendRequest.to.toString();

    // Remove from friend requests arrays
    await Promise.all([
      User.findByIdAndUpdate(fromUserId, {
        $pull: { friendRequestsSent: toUserId },
      }),
      User.findByIdAndUpdate(toUserId, {
        $pull: { friendRequestsReceived: fromUserId },
      }),
    ]);

    return NextResponse.json({ message: 'Friend request cancelled' }, { status: 200 });
  } catch (error: any) {
    console.error('Cancel friend request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel friend request' },
      { status: 500 }
    );
  }
}

