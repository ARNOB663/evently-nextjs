import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { authenticateRequest } from '@/lib/middleware/auth';

// POST /api/events/[id]/join - Join an event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate
    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is open
    if (event.status !== 'open') {
      return NextResponse.json(
        { error: `Cannot join event. Event is ${event.status}` },
        { status: 400 }
      );
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      );
    }

    // Check if user is already a participant
    if (event.participants.includes(user.userId as any)) {
      return NextResponse.json(
        { error: 'You are already a participant in this event' },
        { status: 400 }
      );
    }

    // Check if user is the host
    if (event.hostId.toString() === user.userId) {
      return NextResponse.json(
        { error: 'Host cannot join their own event' },
        { status: 400 }
      );
    }

    // Add user to participants
    event.participants.push(user.userId as any);
    event.currentParticipants += 1;

    // Update status if full
    if (event.currentParticipants >= event.maxParticipants) {
      event.status = 'full';
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('hostId', 'fullName profileImage averageRating')
      .populate('participants', 'fullName profileImage');

    return NextResponse.json(
      {
        message: 'Successfully joined event',
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Join event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/join - Leave an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate
    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    if (!event.participants.includes(user.userId as any)) {
      return NextResponse.json(
        { error: 'You are not a participant in this event' },
        { status: 400 }
      );
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      (id) => id.toString() !== user.userId
    );
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);

    // Update status if it was full
    if (event.status === 'full' && event.currentParticipants < event.maxParticipants) {
      event.status = 'open';
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('hostId', 'fullName profileImage averageRating')
      .populate('participants', 'fullName profileImage');

    return NextResponse.json(
      {
        message: 'Successfully left event',
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Leave event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to leave event' },
      { status: 500 }
    );
  }
}

