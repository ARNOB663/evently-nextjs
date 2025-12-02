import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/lib/models/Message';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/messages/conversations - Get all conversations
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    // Get all unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: user.userId }, { receiver: user.userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', user.userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', user.userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          fullName: '$user.fullName',
          profileImage: '$user.profileImage',
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            sender: '$lastMessage.sender',
            receiver: '$lastMessage.receiver',
            isRead: '$lastMessage.isRead',
            createdAt: '$lastMessage.createdAt',
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

