import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EventPhoto from '@/lib/models/EventPhoto';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/events/[id]/photos - Get photos for an event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const photos = await EventPhoto.find({ eventId: id })
      .populate('userId', 'fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EventPhoto.countDocuments({ eventId: id });

    return NextResponse.json(
      {
        photos,
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
    console.error('Get photos error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get photos' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/photos - Upload photo to event
export async function POST(
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

    const { id } = await params;
    const body = await req.json();
    const { imageUrl, caption } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Check if event exists and user is a participant or host
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isParticipant = event.participants.includes(user.userId as any);
    const isHost = event.hostId.toString() === user.userId;

    if (!isParticipant && !isHost) {
      return NextResponse.json(
        { error: 'Only participants and hosts can upload photos' },
        { status: 403 }
      );
    }

    const photo = await EventPhoto.create({
      eventId: id,
      userId: user.userId,
      imageUrl,
      caption: caption || '',
    });

    const populatedPhoto = await EventPhoto.findById(photo._id)
      .populate('userId', 'fullName profileImage')
      .populate('eventId', 'eventName');

    return NextResponse.json({ photo: populatedPhoto, message: 'Photo uploaded successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

