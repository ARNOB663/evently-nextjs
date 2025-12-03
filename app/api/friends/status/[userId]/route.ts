import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/friends/status/[userId] - Get friend status with a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const currentUser = await User.findById(user.userId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if blocked
    const isBlocked = currentUser.blockedUsers.includes(userId) || targetUser.blockedUsers.includes(user.userId);

    if (isBlocked) {
      return NextResponse.json({
        status: 'blocked',
        isBlocked: true,
      });
    }

    // Check if friends
    const isFriend = currentUser.friends.includes(userId);

    if (isFriend) {
      return NextResponse.json({
        status: 'friends',
        isFriend: true,
      });
    }

    // Check for pending friend requests
    const sentRequest = await FriendRequest.findOne({
      from: user.userId,
      to: userId,
      status: 'pending',
    });

    const receivedRequest = await FriendRequest.findOne({
      from: userId,
      to: user.userId,
      status: 'pending',
    });

    if (sentRequest) {
      return NextResponse.json({
        status: 'request_sent',
        requestId: sentRequest._id,
      });
    }

    if (receivedRequest) {
      return NextResponse.json({
        status: 'request_received',
        requestId: receivedRequest._id,
      });
    }

    // Calculate mutual friends
    const mutualFriends = currentUser.friends.filter((friendId) =>
      targetUser.friends.includes(friendId)
    );
    const mutualFriendsData = await User.find({ _id: { $in: mutualFriends } })
      .select('fullName profileImage')
      .limit(10);

    return NextResponse.json({
      status: 'none',
      isFriend: false,
      mutualFriends: mutualFriendsData,
      mutualFriendsCount: mutualFriends.length,
    });
  } catch (error: any) {
    console.error('Get friend status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get friend status' },
      { status: 500 }
    );
  }
}

