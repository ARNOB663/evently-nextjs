import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { authenticateRequest } from '@/lib/middleware/auth';

// POST /api/events/[id]/duplicate - Duplicate an event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the original event
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

    // Get new date from request body (optional)
    const body = await req.json().catch(() => ({}));
    const newDate = body.date ? new Date(body.date) : new Date();
    
    // Add 7 days to the original date if no date provided
    if (!body.date) {
      newDate.setDate(newDate.getDate() + 7);
    }

    // Create duplicated event
    const duplicatedEvent = new Event({
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
      currentParticipants: 0,
      joiningFee: originalEvent.joiningFee,
      image: originalEvent.image,
      images: originalEvent.images,
      ticketTypes: originalEvent.ticketTypes,
      agenda: originalEvent.agenda,
      tags: originalEvent.tags,
      category: originalEvent.category,
      status: 'draft', // Start as draft
      isDraft: true,
      participants: [],
    });

    await duplicatedEvent.save();

    return NextResponse.json(
      {
        message: 'Event duplicated successfully',
        event: duplicatedEvent,
      },
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
