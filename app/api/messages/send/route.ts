import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Message from '@/lib/models/Message';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/messages/send - Send a message
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver ID and content are required' }, { status: 400 });
    }

    if (receiverId === user.userId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    // Check if users exist and are friends
    const [currentUser, receiver] = await Promise.all([
      User.findById(user.userId),
      User.findById(receiverId),
    ]);

    if (!currentUser || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if blocked
    if (currentUser.blockedUsers.includes(receiverId) || receiver.blockedUsers.includes(user.userId)) {
      return NextResponse.json({ error: 'Cannot send message' }, { status: 403 });
    }

    // Check if friends (for 1:1 messaging, only friends can message)
    if (!currentUser.friends.includes(receiverId)) {
      return NextResponse.json({ error: 'Can only message friends' }, { status: 403 });
    }

    // Create message
    const message = await Message.create({
      sender: user.userId,
      receiver: receiverId,
      content: content.trim(),
      isRead: false,
    });

    // Create notification
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: 'New Message',
      message: `${currentUser.fullName} sent you a message`,
      relatedUser: user.userId,
      isRead: false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName profileImage')
      .populate('receiver', 'fullName profileImage');

    return NextResponse.json(
      { message: 'Message sent', data: populatedMessage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

