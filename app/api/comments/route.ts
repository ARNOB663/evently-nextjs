import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Comment from '@/lib/models/Comment';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/comments - Create a comment
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, content } = body;

    if (!eventId || !content) {
      return NextResponse.json({ error: 'Event ID and content are required' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment cannot exceed 1000 characters' }, { status: 400 });
    }

    const comment = await Comment.create({
      eventId,
      userId: user.userId,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'fullName profileImage')
      .populate('eventId', 'eventName');

    return NextResponse.json({ comment: populatedComment, message: 'Comment created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// GET /api/comments - Get comments for an event
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const comments = await Comment.find({ eventId })
      .populate('userId', 'fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ eventId });

    return NextResponse.json(
      {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get comments' },
      { status: 500 }
    );
  }
}

