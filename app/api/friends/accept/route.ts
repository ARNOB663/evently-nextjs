import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/middleware/auth';
import mongoose from 'mongoose';
import { sendEmail, generateEmailTemplate } from '@/lib/utils/email';

// POST /api/friends/accept - Accept friend request
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

    // Find the friend request (don't populate first to check ownership)
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Verify the request is for the current user
    // Use Mongoose ObjectId comparison for reliability
    const toObjectId = new mongoose.Types.ObjectId(friendRequest.to);
    const currentUserObjectId = new mongoose.Types.ObjectId(user.userId);

    if (!toObjectId.equals(currentUserObjectId)) {
      console.error('Friend request authorization failed:', {
        requestId,
        toUserId: toObjectId.toString(),
        currentUserId: currentUserObjectId.toString(),
        toObject: friendRequest.to,
        toObjectType: typeof friendRequest.to,
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized - You can only accept requests sent to you'
        },
        { status: 403 }
      );
    }

    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Friend request is not pending' }, { status: 400 });
    }

    // Update friend request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    const fromUserId = friendRequest.from.toString();
    const toUserId = friendRequest.to.toString();

    // Populate for response
    const populatedRequest = await FriendRequest.findById(requestId)
      .populate('from', 'fullName profileImage')
      .populate('to', 'fullName profileImage');

    // Add to friends list for both users
    await Promise.all([
      User.findByIdAndUpdate(fromUserId, {
        $addToSet: { friends: toUserId },
        $pull: { friendRequestsSent: toUserId },
      }),
      User.findByIdAndUpdate(toUserId, {
        $addToSet: { friends: fromUserId },
        $pull: { friendRequestsReceived: fromUserId },
      }),
    ]);

    // Create notification for the sender
    const currentUser = await User.findById(toUserId);
    await Notification.create({
      user: fromUserId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${currentUser?.fullName} accepted your friend request`,
      relatedUser: toUserId,
      isRead: false,
    });

    // Send email notification
    const fromUser = await User.findById(fromUserId);
    if (fromUser?.email) {
      await sendEmail({
        to: fromUser.email,
        subject: 'Friend Request Accepted',
        html: generateEmailTemplate('friend_accepted', {
          fromName: currentUser?.fullName || 'Someone',
          userId: toUserId,
        }),
      });
    }

    return NextResponse.json(
      { message: 'Friend request accepted', friendRequest: populatedRequest },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Accept friend request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}

