import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/notifications - Get all notifications
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query: any = { user: user.userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedUser', 'fullName profileImage')
      .populate('relatedEvent', 'eventName image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const unreadCount = await Notification.countDocuments({
      user: user.userId,
      isRead: false,
    });

    return NextResponse.json(
      {
        notifications,
        unreadCount,
        hasMore: notifications.length === limit,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Notification IDs array is required' }, { status: 400 });
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        user: user.userId,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return NextResponse.json({ message: 'Notifications marked as read' }, { status: 200 });
  } catch (error: any) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      await Notification.deleteMany({ user: user.userId });
      return NextResponse.json({ message: 'All notifications deleted' }, { status: 200 });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    await Notification.findOneAndDelete({
      _id: notificationId,
      user: user.userId,
    });

    return NextResponse.json({ message: 'Notification deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

