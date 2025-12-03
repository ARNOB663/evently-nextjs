import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/friends/block - Block a user
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === user.userId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    const currentUser = await User.findById(user.userId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add to blocked list
    await User.findByIdAndUpdate(user.userId, {
      $addToSet: { blockedUsers: userId },
      $pull: { friends: userId },
    });

    // Remove from target user's friends if they were friends
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: user.userId },
    });

    // Cancel any pending friend requests
    await FriendRequest.updateMany(
      {
        $or: [
          { from: user.userId, to: userId, status: 'pending' },
          { from: userId, to: user.userId, status: 'pending' },
        ],
      },
      { status: 'cancelled' }
    );

    return NextResponse.json({ message: 'User blocked successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Block user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to block user' },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/block - Unblock a user
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await User.findByIdAndUpdate(user.userId, {
      $pull: { blockedUsers: userId },
    });

    return NextResponse.json({ message: 'User unblocked successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Unblock user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unblock user' },
      { status: 500 }
    );
  }
}

