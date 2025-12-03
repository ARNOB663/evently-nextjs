import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/middleware/auth';
import { sendEmail, generateEmailTemplate } from '@/lib/utils/email';

// POST /api/friends/request - Send friend request
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, message } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === user.userId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if users exist
    const [currentUser, targetUser] = await Promise.all([
      User.findById(user.userId),
      User.findById(userId),
    ]);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already friends
    if (currentUser.friends.includes(userId)) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Check if blocked
    if (currentUser.blockedUsers.includes(userId) || targetUser.blockedUsers.includes(user.userId)) {
      return NextResponse.json({ error: 'Cannot send friend request' }, { status: 403 });
    }

    // Check privacy settings
    if (targetUser.privacySettings?.friendRequests === 'no one') {
      return NextResponse.json({ error: 'User does not accept friend requests' }, { status: 403 });
    }

    if (targetUser.privacySettings?.friendRequests === 'friends of friends') {
      const mutualFriends = currentUser.friends.filter((friendId) =>
        targetUser.friends.includes(friendId)
      );
      if (mutualFriends.length === 0) {
        return NextResponse.json({ error: 'User only accepts friend requests from friends of friends' }, { status: 403 });
      }
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: user.userId, to: userId, status: 'pending' },
        { from: userId, to: user.userId, status: 'pending' },
      ],
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      from: user.userId,
      to: userId,
      message: message || '',
      status: 'pending',
    });

    // Update user arrays
    await User.findByIdAndUpdate(user.userId, {
      $addToSet: { friendRequestsSent: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friendRequestsReceived: user.userId },
    });

    // Create notification
    await Notification.create({
      user: userId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${currentUser.fullName} sent you a friend request`,
      relatedUser: user.userId,
      isRead: false,
    });

    // Send email notification
    if (targetUser.email) {
      await sendEmail({
        to: targetUser.email,
        subject: 'New Friend Request',
        html: generateEmailTemplate('friend_request', {
          fromName: currentUser.fullName,
        }),
      });
    }

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('from', 'fullName profileImage')
      .populate('to', 'fullName profileImage');

    return NextResponse.json(
      { message: 'Friend request sent', friendRequest: populatedRequest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Send friend request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send friend request' },
      { status: 500 }
    );
  }
}

// GET /api/friends/request - Get friend requests (sent and received)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    let query: any = {};
    if (type === 'sent') {
      query = { from: user.userId, status: 'pending' };
    } else {
      query = { to: user.userId, status: 'pending' };
    }

    const requests = await FriendRequest.find(query)
      .populate('from', 'fullName profileImage')
      .populate('to', 'fullName profileImage')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error: any) {
    console.error('Get friend requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get friend requests' },
      { status: 500 }
    );
  }
}

