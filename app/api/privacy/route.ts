import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/privacy - Get privacy settings
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const currentUser = await User.findById(user.userId).select('privacySettings');

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { privacySettings: currentUser.privacySettings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get privacy settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get privacy settings' },
      { status: 500 }
    );
  }
}

// PUT /api/privacy - Update privacy settings
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { privacySettings } = body;

    if (!privacySettings) {
      return NextResponse.json({ error: 'Privacy settings are required' }, { status: 400 });
    }

    // Validate privacy settings
    if (
      privacySettings.profileVisibility &&
      !['everyone', 'friends', 'only me'].includes(privacySettings.profileVisibility)
    ) {
      return NextResponse.json({ error: 'Invalid profile visibility setting' }, { status: 400 });
    }

    if (
      privacySettings.friendRequests &&
      !['everyone', 'friends of friends', 'no one'].includes(privacySettings.friendRequests)
    ) {
      return NextResponse.json({ error: 'Invalid friend requests setting' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        $set: {
          privacySettings: {
            ...privacySettings,
          },
        },
      },
      { new: true }
    ).select('privacySettings');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Privacy settings updated', privacySettings: updatedUser.privacySettings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update privacy settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

