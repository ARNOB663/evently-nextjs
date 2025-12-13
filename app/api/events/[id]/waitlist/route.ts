import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Waitlist from '@/lib/models/Waitlist';
import Notification from '@/lib/models/Notification';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/events/[id]/waitlist - Get waitlist for an event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if user is authenticated (optional for viewing position)
    const authCheck = requireAuth();
    const { user } = await authCheck(req);

    const waitlist = await Waitlist.find({ eventId: id, status: 'waiting' })
      .populate('userId', 'fullName profileImage')
      .sort({ position: 1 });

    // If user is authenticated, find their position
    let userPosition = null;
    if (user) {
      const userEntry = await Waitlist.findOne({ eventId: id, userId: user.userId });
      if (userEntry) {
        userPosition = {
          position: userEntry.position,
          status: userEntry.status,
          joinedAt: userEntry.joinedAt,
        };
      }
    }

    return NextResponse.json({
      waitlist: waitlist.map((w) => ({
        position: w.position,
        user: w.userId,
        joinedAt: w.joinedAt,
      })),
      totalWaiting: waitlist.length,
      userPosition,
    });
  } catch (error: any) {
    console.error('Get waitlist error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get waitlist' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/waitlist - Join waitlist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event is full
    if (event.currentParticipants < event.maxParticipants) {
      return NextResponse.json(
        { error: 'Event is not full. You can join directly.' },
        { status: 400 }
      );
    }

    // Check if user is already a participant
    if (event.participants.includes(user.userId)) {
      return NextResponse.json(
        { error: 'You are already a participant' },
        { status: 400 }
      );
    }

    // Check if user is the host
    if (event.hostId.toString() === user.userId) {
      return NextResponse.json(
        { error: 'Hosts cannot join their own event waitlist' },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const existingEntry = await Waitlist.findOne({ eventId: id, userId: user.userId });
    if (existingEntry) {
      return NextResponse.json(
        { error: 'You are already on the waitlist', position: existingEntry.position },
        { status: 400 }
      );
    }

    // Get next position
    const lastEntry = await Waitlist.findOne({ eventId: id })
      .sort({ position: -1 })
      .select('position');
    const nextPosition = (lastEntry?.position || 0) + 1;

    // Create waitlist entry
    const waitlistEntry = await Waitlist.create({
      eventId: id,
      userId: user.userId,
      position: nextPosition,
    });

    return NextResponse.json(
      {
        message: 'Successfully joined the waitlist',
        position: waitlistEntry.position,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Join waitlist error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/waitlist - Leave waitlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Find and remove waitlist entry
    const entry = await Waitlist.findOneAndDelete({
      eventId: id,
      userId: user.userId,
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'You are not on the waitlist' },
        { status: 404 }
      );
    }

    // Update positions for users behind
    await Waitlist.updateMany(
      { eventId: id, position: { $gt: entry.position } },
      { $inc: { position: -1 } }
    );

    return NextResponse.json({ message: 'Successfully left the waitlist' });
  } catch (error: any) {
    console.error('Leave waitlist error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to leave waitlist' },
      { status: 500 }
    );
  }
}
