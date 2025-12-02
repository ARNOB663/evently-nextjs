import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/users/[id]/events - Get user's events (hosted and joined)
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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // 'all', 'hosted', 'joined', 'past', 'upcoming'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const now = new Date();
    let query: any = {};

    if (type === 'hosted') {
      query = { hostId: userId };
    } else if (type === 'joined') {
      query = { participants: userId, hostId: { $ne: userId } };
    } else if (type === 'past') {
      query = {
        $or: [{ hostId: userId }, { participants: userId }],
        date: { $lt: now },
      };
    } else if (type === 'upcoming') {
      query = {
        $or: [{ hostId: userId }, { participants: userId }],
        date: { $gte: now },
      };
    } else {
      query = {
        $or: [{ hostId: userId }, { participants: userId }],
      };
    }

    const events = await Event.find(query)
      .populate('hostId', 'fullName profileImage')
      .select('eventName eventType date time location image status currentParticipants maxParticipants')
      .sort({ date: type === 'past' ? -1 : 1 })
      .limit(50);

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    console.error('Get user events error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user events' },
      { status: 500 }
    );
  }
}

