import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/events/[id]/export - Export attendees as CSV
export async function GET(
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

    const event = await Event.findById(id)
      .populate('participants', 'fullName email phoneNumber location');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is the host or admin
    if (event.hostId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to export attendees for this event' },
        { status: 403 }
      );
    }

    // Generate CSV
    const headers = ['Name', 'Email', 'Phone', 'Location'];
    const rows = event.participants.map((p: any) => [
      p.fullName || '',
      p.email || '',
      p.phoneNumber || '',
      p.location || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${event.eventName.replace(/[^a-zA-Z0-9]/g, '_')}_attendees.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export attendees error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export attendees' },
      { status: 500 }
    );
  }
}
