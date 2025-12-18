import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET /api/events/saved - Get user's saved/bookmarked events
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUser = await User.findById(user.userId)
      .populate({
        path: 'favoriteEvents',
        populate: {
          path: 'hostId',
          select: 'fullName profileImage',
        },
      });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { savedEvents: currentUser.favoriteEvents || [] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get saved events error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get saved events' },
      { status: 500 }
    );
  }
}

// POST /api/events/saved - Save/unsave an event
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const currentUser = await User.findById(user.userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const savedEvents = currentUser.favoriteEvents || [];
    const eventIndex = savedEvents.findIndex(
      (id: any) => id.toString() === eventId
    );

    let isSaved: boolean;
    if (eventIndex > -1) {
      // Remove from saved
      savedEvents.splice(eventIndex, 1);
      isSaved = false;
    } else {
      // Add to saved
      savedEvents.push(eventId);
      isSaved = true;
    }

    currentUser.favoriteEvents = savedEvents;
    await currentUser.save();

    return NextResponse.json(
      {
        message: isSaved ? 'Event saved' : 'Event unsaved',
        isSaved,
      },
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
