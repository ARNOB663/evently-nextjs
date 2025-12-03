import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/events/[id]/favorite - Add event to favorites
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

    const userDoc = await User.findById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userDoc.favoriteEvents) {
      userDoc.favoriteEvents = [];
    }

    if (userDoc.favoriteEvents.includes(id as any)) {
      return NextResponse.json({ error: 'Event already in favorites' }, { status: 400 });
    }

    userDoc.favoriteEvents.push(id as any);
    await userDoc.save();

    return NextResponse.json({ message: 'Event added to favorites' }, { status: 200 });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/favorite - Remove event from favorites
export async function DELETE(
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

    const userDoc = await User.findById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userDoc.favoriteEvents) {
      userDoc.favoriteEvents = [];
    }

    userDoc.favoriteEvents = userDoc.favoriteEvents.filter(
      (eventId) => eventId.toString() !== id
    );
    await userDoc.save();

    return NextResponse.json({ message: 'Event removed from favorites' }, { status: 200 });
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}

