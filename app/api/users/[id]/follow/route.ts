import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// GET /api/users/[id]/follow - Check if current user follows this user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: targetUserId } = await params;

    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUser = await User.findById(user.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isFollowing = currentUser.followingHosts?.some(
      (id: mongoose.Types.ObjectId) => id.toString() === targetUserId
    );

    // Get follower count for target user
    const targetUser = await User.findById(targetUserId);
    const followerCount = targetUser?.followers?.length || 0;

    return NextResponse.json({
      isFollowing,
      followerCount,
    });
  } catch (error: any) {
    console.error('Check follow status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check follow status' },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/follow - Follow a user (host)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: targetUserId } = await params;

    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.userId === targetUserId) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if target is a host
    if (targetUser.role !== 'host' && targetUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only follow event hosts' },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await User.findById(user.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    if (currentUser.followingHosts?.some(
      (id: mongoose.Types.ObjectId) => id.toString() === targetUserId
    )) {
      return NextResponse.json(
        { error: 'You are already following this user' },
        { status: 400 }
      );
    }

    // Add to following/followers
    await User.findByIdAndUpdate(user.userId, {
      $addToSet: { followingHosts: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: user.userId },
    });

    // Create notification for the host
    await Notification.create({
      userId: targetUserId,
      type: 'follow',
      title: 'New Follower',
      message: `${currentUser.fullName} started following you`,
      data: {
        followerId: user.userId,
        followerName: currentUser.fullName,
        followerImage: currentUser.profileImage,
      },
    });

    // Get updated follower count
    const updatedTargetUser = await User.findById(targetUserId);

    return NextResponse.json({
      message: 'Successfully followed',
      followerCount: updatedTargetUser?.followers?.length || 0,
    });
  } catch (error: any) {
    console.error('Follow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to follow user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: targetUserId } = await params;

    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Remove from following/followers
    await User.findByIdAndUpdate(user.userId, {
      $pull: { followingHosts: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: user.userId },
    });

    // Get updated follower count
    const updatedTargetUser = await User.findById(targetUserId);

    return NextResponse.json({
      message: 'Successfully unfollowed',
      followerCount: updatedTargetUser?.followers?.length || 0,
    });
  } catch (error: any) {
    console.error('Unfollow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
