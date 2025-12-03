import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/friends/unfriend - Unfriend a user
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
      return NextResponse.json({ error: 'Cannot unfriend yourself' }, { status: 400 });
    }

    // Check if users are friends
    const currentUser = await User.findById(user.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!currentUser.friends.includes(userId)) {
      return NextResponse.json({ error: 'Not friends' }, { status: 400 });
    }

    // Remove from friends list for both users
    await Promise.all([
      User.findByIdAndUpdate(user.userId, {
        $pull: { friends: userId },
      }),
      User.findByIdAndUpdate(userId, {
        $pull: { friends: user.userId },
      }),
    ]);

    return NextResponse.json({ message: 'Unfriended successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Unfriend error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unfriend' },
      { status: 500 }
    );
  }
}

