import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/users/search - Search users
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    const currentUser = await User.findById(user.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Search users (excluding blocked users and self)
    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      _id: {
        $ne: user.userId,
        $nin: currentUser.blockedUsers,
      },
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { location: searchRegex },
        { interests: { $in: [searchRegex] } },
      ],
    })
      .select('fullName profileImage bio location interests preferredEventTypes')
      .limit(limit);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}

