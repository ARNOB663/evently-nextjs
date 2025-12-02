import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/users/recommendations - Get recommended users
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all'; // 'all', 'events', 'friends', 'hosts'

    const currentUser = await User.findById(user.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let recommendedUsers: any[] = [];

    if (type === 'events' || type === 'all') {
      // Users who attended the same events
      const userEvents = await Event.find({
        $or: [
          { hostId: user.userId },
          { participants: user.userId },
        ],
      }).select('participants hostId');

      const eventUserIds = new Set<string>();
      userEvents.forEach((event) => {
        event.participants.forEach((p: any) => {
          if (p.toString() !== user.userId) eventUserIds.add(p.toString());
        });
        if (event.hostId.toString() !== user.userId) {
          eventUserIds.add(event.hostId.toString());
        }
      });

      const eventBasedUsers = await User.find({
        _id: {
          $in: Array.from(eventUserIds),
          $ne: user.userId,
          $nin: [...currentUser.friends, ...currentUser.blockedUsers],
        },
      })
        .select('fullName profileImage bio location interests')
        .limit(limit);

      recommendedUsers.push(...eventBasedUsers);
    }

    if (type === 'friends' || type === 'all') {
      // Friends of friends
      const friendIds = currentUser.friends.map((f) => f.toString());
      if (friendIds.length > 0) {
        const friendsOfFriends = await User.find({
          _id: {
            $in: friendIds,
          },
        })
          .select('friends')
          .lean();

        const friendsOfFriendsIds = new Set<string>();
        friendsOfFriends.forEach((friend: any) => {
          friend.friends.forEach((f: any) => {
            const friendId = f.toString();
            if (
              friendId !== user.userId &&
              !friendIds.includes(friendId) &&
              !currentUser.blockedUsers.includes(friendId)
            ) {
              friendsOfFriendsIds.add(friendId);
            }
          });
        });

        const fofUsers = await User.find({
          _id: { $in: Array.from(friendsOfFriendsIds) },
        })
          .select('fullName profileImage bio location interests')
          .limit(limit);

        recommendedUsers.push(...fofUsers);
      }
    }

    if (type === 'hosts' || type === 'all') {
      // Popular hosts
      const popularHosts = await User.find({
        role: 'host',
        _id: {
          $ne: user.userId,
          $nin: [...currentUser.friends, ...currentUser.blockedUsers],
        },
      })
        .select('fullName profileImage bio location averageRating totalReviews')
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(limit);

      recommendedUsers.push(...popularHosts);
    }

    // Remove duplicates and limit
    const uniqueUsers = Array.from(
      new Map(recommendedUsers.map((u) => [u._id.toString(), u])).values()
    ).slice(0, limit);

    return NextResponse.json({ users: uniqueUsers }, { status: 200 });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

