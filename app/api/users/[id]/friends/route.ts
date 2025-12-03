import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET /api/users/[id]/friends - Get user's friends list
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId).select('friends privacySettings');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check privacy settings
    let canViewFriends = true;
    try {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;
      
      if (token) {
        const { user: authUser } = await authenticateRequest(req);
        if (authUser) {
          const currentUser = await User.findById(authUser.userId);
          if (currentUser) {
            // Check if viewing own profile
            if (authUser.userId === userId) {
              canViewFriends = true;
            } else {
              // Check privacy settings
              if (user.privacySettings?.showFriendList === false) {
                canViewFriends = false;
              } else if (user.privacySettings?.profileVisibility === 'only me') {
                canViewFriends = false;
              } else if (user.privacySettings?.profileVisibility === 'friends') {
                canViewFriends = currentUser.friends.some(
                  (friendId) => friendId.toString() === userId
                );
              }
            }
          }
        }
      } else {
        // Not authenticated - check if profile is public
        if (user.privacySettings?.profileVisibility === 'only me' || 
            user.privacySettings?.profileVisibility === 'friends' ||
            user.privacySettings?.showFriendList === false) {
          canViewFriends = false;
        }
      }
    } catch (err) {
      // If auth fails, check if profile is public
      if (user.privacySettings?.profileVisibility === 'only me' || 
          user.privacySettings?.profileVisibility === 'friends' ||
          user.privacySettings?.showFriendList === false) {
        canViewFriends = false;
      }
    }

    if (!canViewFriends) {
      return NextResponse.json({ error: 'Friend list is private' }, { status: 403 });
    }

    // Get friends with populated data
    const friends = await User.find({ _id: { $in: user.friends } })
      .select('fullName profileImage bio location interests role')
      .limit(100);

    return NextResponse.json({ friends, totalCount: user.friends.length }, { status: 200 });
  } catch (error: any) {
    console.error('Get friends error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get friends' },
      { status: 500 }
    );
  }
}

