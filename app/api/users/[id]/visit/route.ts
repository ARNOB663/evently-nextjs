import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import ProfileVisit from '@/lib/models/ProfileVisit';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/users/[id]/visit - Record a profile visit
export async function POST(
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

    const { id: visitedUserId } = await params;

    if (!visitedUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (visitedUserId === user.userId) {
      return NextResponse.json({ message: 'Self visit recorded' }, { status: 200 });
    }

    const visitedUser = await User.findById(visitedUserId);
    if (!visitedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check privacy settings
    if (visitedUser.privacySettings?.showProfileVisits === false) {
      return NextResponse.json({ message: 'Profile visits are private' }, { status: 200 });
    }

    // Record visit (only once per day per visitor)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingVisit = await ProfileVisit.findOne({
      visitor: user.userId,
      visitedUser: visitedUserId,
      createdAt: { $gte: today },
    });

    if (!existingVisit) {
      await ProfileVisit.create({
        visitor: user.userId,
        visitedUser: visitedUserId,
      });

      // Create notification if enabled
      const visitor = await User.findById(user.userId);
      const showVisits = visitedUser.privacySettings?.showProfileVisits;
      if (visitor && (showVisits === undefined || showVisits === true)) {
        await Notification.create({
          user: visitedUserId,
          type: 'profile_visit',
          title: 'Profile Visit',
          message: `${visitor.fullName} visited your profile`,
          relatedUser: user.userId,
          isRead: false,
        });
      }
    }

    return NextResponse.json({ message: 'Visit recorded' }, { status: 200 });
  } catch (error: any) {
    console.error('Record profile visit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record visit' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/visit - Get recent profile visitors
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

    if (userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const visits = await ProfileVisit.find({ visitedUser: userId })
      .populate('visitor', 'fullName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ visits }, { status: 200 });
  } catch (error: any) {
    console.error('Get profile visits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get profile visits' },
      { status: 500 }
    );
  }
}

