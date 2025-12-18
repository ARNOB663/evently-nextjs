import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { authenticateRequest, requireAuth } from '@/lib/middleware/auth';

// GET /api/events/[id] - Get single event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const event = await Event.findById(id)
      .populate('hostId', 'fullName profileImage averageRating totalReviews bio interests location')
      .populate('participants', 'fullName profileImage');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
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

    // Check if user is the host or admin
    if (event.hostId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to update this event' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      eventName,
      eventType,
      description,
      date,
      time,
      location,
      latitude,
      longitude,
      minParticipants,
      maxParticipants,
      joiningFee,
      image,
      status,
      tags,
      category,
      isDraft,
      recurrence,
    } = body;

    // Build update object
    const updateData: any = {};
    if (eventName) updateData.eventName = eventName;
    if (eventType) updateData.eventType = eventType;
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = Number(latitude);
    if (longitude !== undefined) updateData.longitude = Number(longitude);
    if (minParticipants) updateData.minParticipants = minParticipants;
    if (maxParticipants) updateData.maxParticipants = maxParticipants;
    if (joiningFee !== undefined) updateData.joiningFee = joiningFee;
    if (image !== undefined) updateData.image = image;
    if (status && ['open', 'full', 'cancelled', 'completed', 'draft'].includes(status)) {
      updateData.status = status;
    }
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (isDraft !== undefined) updateData.isDraft = isDraft;
    if (recurrence !== undefined) updateData.recurrence = recurrence;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('hostId', 'fullName profileImage averageRating')
      .populate('participants', 'fullName profileImage');

    return NextResponse.json(
      { message: 'Event updated successfully', event: updatedEvent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
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

    // Check if user is the host or admin
    if (event.hostId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this event' },
        { status: 403 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}

