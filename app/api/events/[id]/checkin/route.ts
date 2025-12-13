import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Booking from '@/lib/models/Booking';
import { requireAuth } from '@/lib/middleware/auth';
import { parseQRCodeData } from '@/lib/utils/qrcode';

// POST /api/events/[id]/checkin - Check in a booking
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: eventId } = await params;

    const authCheck = requireAuth(['host', 'admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { qrData, bookingId } = body;

    // Verify the event exists and user is the host
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.hostId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the event host can check in attendees' },
        { status: 403 }
      );
    }

    let booking;

    if (qrData) {
      // Parse QR code data
      const parsed = parseQRCodeData(qrData);
      if (!parsed) {
        return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
      }

      // Verify QR code is for this event
      if (parsed.eventId !== eventId) {
        return NextResponse.json(
          { error: 'QR code is for a different event' },
          { status: 400 }
        );
      }

      booking = await Booking.findById(parsed.bookingId).populate('userId', 'fullName email profileImage');
    } else if (bookingId) {
      booking = await Booking.findOne({ _id: bookingId, eventId }).populate('userId', 'fullName email profileImage');
    } else {
      return NextResponse.json(
        { error: 'QR code data or booking ID required' },
        { status: 400 }
      );
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: `Booking is ${booking.status}. Cannot check in.` },
        { status: 400 }
      );
    }

    if (booking.checkedIn) {
      return NextResponse.json(
        {
          error: 'Already checked in',
          checkedInAt: booking.checkedInAt,
          attendee: booking.userId,
        },
        { status: 400 }
      );
    }

    // Perform check-in
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = user.userId;
    await booking.save();

    return NextResponse.json({
      message: 'Check-in successful',
      booking: {
        _id: booking._id,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        attendee: booking.userId,
        checkedInAt: booking.checkedInAt,
      },
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check in' },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/checkin - Get check-in stats
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: eventId } = await params;

    const authCheck = requireAuth(['host', 'admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the event exists and user is the host
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.hostId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the event host can view check-in stats' },
        { status: 403 }
      );
    }

    // Get check-in stats
    const totalBookings = await Booking.countDocuments({ eventId, status: 'confirmed' });
    const checkedIn = await Booking.countDocuments({ eventId, status: 'confirmed', checkedIn: true });
    const notCheckedIn = totalBookings - checkedIn;

    // Get recent check-ins
    const recentCheckIns = await Booking.find({ eventId, checkedIn: true })
      .populate('userId', 'fullName profileImage')
      .sort({ checkedInAt: -1 })
      .limit(10);

    // Get attendee list
    const attendees = await Booking.find({ eventId, status: 'confirmed' })
      .populate('userId', 'fullName email profileImage')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      stats: {
        total: totalBookings,
        checkedIn,
        notCheckedIn,
        checkInRate: totalBookings > 0 ? Math.round((checkedIn / totalBookings) * 100) : 0,
      },
      recentCheckIns: recentCheckIns.map((b) => ({
        attendee: b.userId,
        ticketType: b.ticketType,
        quantity: b.quantity,
        checkedInAt: b.checkedInAt,
      })),
      attendees: attendees.map((b) => ({
        _id: b._id,
        attendee: b.userId,
        ticketType: b.ticketType,
        quantity: b.quantity,
        checkedIn: b.checkedIn,
        checkedInAt: b.checkedInAt,
      })),
    });
  } catch (error: any) {
    console.error('Get check-in stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get check-in stats' },
      { status: 500 }
    );
  }
}
