import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// POST /api/events/[id]/save - Save/bookmark an event
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

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user.userId);

    // Check if already saved
    const alreadySaved = event.savedBy?.some(
      (savedUserId: mongoose.Types.ObjectId) => savedUserId.toString() === user.userId
    );

    if (alreadySaved) {
      return NextResponse.json(
        { error: 'Event already saved' },
        { status: 400 }
      );
    }

    // Add to event's savedBy array
    await Event.findByIdAndUpdate(id, {
      $addToSet: { savedBy: userId },
    });

    // Also add to user's favoriteEvents for backward compatibility
    await User.findByIdAndUpdate(user.userId, {
      $addToSet: { favoriteEvents: new mongoose.Types.ObjectId(id) },
    });

    return NextResponse.json(
      { message: 'Event saved successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Save event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/save - Unsave/remove bookmark from event
export async function DELETE(
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

    const userId = new mongoose.Types.ObjectId(user.userId);

    // Remove from event's savedBy array
    await Event.findByIdAndUpdate(id, {
      $pull: { savedBy: userId },
    });

    // Also remove from user's favoriteEvents
    await User.findByIdAndUpdate(user.userId, {
      $pull: { favoriteEvents: new mongoose.Types.ObjectId(id) },
    });

    return NextResponse.json(
      { message: 'Event unsaved successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unsave event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unsave event' },
      { status: 500 }
    );
  }
}
