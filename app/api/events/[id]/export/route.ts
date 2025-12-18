import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Booking from '@/lib/models/Booking';
import { authenticateRequest } from '@/lib/middleware/auth';

// GET /api/events/[id]/export - Export attendees as CSV
export async function GET(
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

    // Find the event with populated participants
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
        { error: 'Unauthorized to export attendees' },
        { status: 403 }
      );
    }

    // Get bookings for check-in status
    const bookings = await Booking.find({ eventId: id });
    const bookingMap = new Map(
      bookings.map((b: any) => [b.userId.toString(), b])
    );

    // Generate CSV
    const csvHeaders = ['Name', 'Email', 'Phone', 'Location', 'Checked In', 'Check-in Time'];
    const csvRows = event.participants.map((participant: any) => {
      const booking = bookingMap.get(participant._id.toString());
      return [
        participant.fullName || '',
        participant.email || '',
        participant.phoneNumber || '',
        participant.location || '',
        booking?.checkedIn ? 'Yes' : 'No',
        booking?.checkedInAt ? new Date(booking.checkedInAt).toLocaleString() : '',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${event.eventName.replace(/[^a-z0-9]/gi, '_')}_attendees.csv"`,
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
