import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/events/[id]/duplicate - Duplicate an event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate and require host role
    const authCheck = requireAuth(['host', 'admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const originalEvent = await Event.findById(id);
    if (!originalEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is the host or admin
    if (originalEvent.hostId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to duplicate this event' },
        { status: 403 }
      );
    }

    // Get new date from body or default to 7 days from now
    const body = await req.json().catch(() => ({}));
    const newDate = body.date ? new Date(body.date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create duplicate event
    const duplicatedEvent = await Event.create({
      hostId: user.userId,
      eventName: `${originalEvent.eventName} (Copy)`,
      eventType: originalEvent.eventType,
      description: originalEvent.description,
      date: newDate,
      time: originalEvent.time,
      endTime: originalEvent.endTime,
      location: originalEvent.location,
      latitude: originalEvent.latitude,
      longitude: originalEvent.longitude,
      minParticipants: originalEvent.minParticipants,
      maxParticipants: originalEvent.maxParticipants,
      joiningFee: originalEvent.joiningFee,
      image: originalEvent.image,
      images: originalEvent.images,
      ticketTypes: originalEvent.ticketTypes,
      agenda: originalEvent.agenda,
      tags: originalEvent.tags,
      isDraft: true, // Always create as draft
      status: 'draft',
      recurrence: { enabled: false },
      currentParticipants: 0,
      participants: [],
      savedBy: [],
    });

    const populatedEvent = await Event.findById(duplicatedEvent._id)
      .populate('hostId', 'fullName profileImage averageRating');

    return NextResponse.json(
      { message: 'Event duplicated successfully', event: populatedEvent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Duplicate event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to duplicate event' },
      { status: 500 }
    );
  }
}
