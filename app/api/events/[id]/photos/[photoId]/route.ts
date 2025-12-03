import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EventPhoto from '@/lib/models/EventPhoto';
import { requireAuth } from '@/lib/middleware/auth';

// DELETE /api/events/[id]/photos/[photoId] - Delete photo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { photoId } = await params;

    const photo = await EventPhoto.findById(photoId);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Check if user owns the photo or is admin
    if (photo.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await EventPhoto.findByIdAndDelete(photoId);

    return NextResponse.json({ message: 'Photo deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

