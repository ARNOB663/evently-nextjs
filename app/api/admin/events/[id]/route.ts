import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// PUT /api/admin/events/[id] - Update event (approve, reject, delete)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authCheck = requireAuth(['admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, action } = body;

    const updateData: any = {};
    if (status && ['open', 'cancelled', 'completed'].includes(status)) {
      updateData.status = status;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true })
      .populate('hostId', 'fullName email profileImage');

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(
      { event: updatedEvent, message: 'Event updated successfully' },
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

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authCheck = requireAuth(['admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}

