import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Payment from '@/lib/models/Payment';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import Activity from '@/lib/models/Activity';
import { authenticateRequest } from '@/lib/middleware/auth';
import { sendEmail, generateEmailTemplate } from '@/lib/utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

// POST /api/payments/verify - Verify payment and join event
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

    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Find the payment record for this user and event
    const payment = await Payment.findOne({
      userId: user.userId,
      eventId: eventId,
    }).sort({ createdAt: -1 }); // Get the most recent payment

    if (!payment) {
      return NextResponse.json(
        { error: 'No payment found for this event' },
        { status: 404 }
      );
    }

    // If payment is already completed, check if user is already a participant
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = event.participants.some(
      (p: any) => p.toString() === user.userId
    );

    if (isAlreadyParticipant) {
      const updatedEvent = await Event.findById(eventId)
        .populate('hostId', 'fullName profileImage averageRating email')
        .populate('participants', 'fullName profileImage');

      return NextResponse.json({
        message: 'Already joined this event',
        event: updatedEvent,
        alreadyJoined: true,
      });
    }

    // If payment is pending, verify with Stripe
    if (payment.status === 'pending' && payment.stripeSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);

        if (session.payment_status === 'paid') {
          // Update payment status
          payment.status = 'completed';
          payment.stripePaymentIntentId = session.payment_intent as string;
          await payment.save();
        } else if (session.payment_status === 'unpaid') {
          return NextResponse.json(
            { error: 'Payment not completed. Please try again.' },
            { status: 402 }
          );
        }
      } catch (stripeError: any) {
        console.error('Stripe verification error:', stripeError);
        // If we can't verify with Stripe, check if payment was already marked completed
        if (payment.status !== 'completed') {
          return NextResponse.json(
            { error: 'Unable to verify payment. Please contact support.' },
            { status: 500 }
          );
        }
      }
    }

    // If payment is not completed, return error
    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      );
    }

    // Check if event is still joinable
    if (event.status !== 'open' && event.status !== 'full') {
      return NextResponse.json(
        { error: `Cannot join event. Event is ${event.status}` },
        { status: 400 }
      );
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      );
    }

    // Add user to participants
    event.participants.push(user.userId as any);
    event.currentParticipants += 1;

    // Update status if full
    if (event.currentParticipants >= event.maxParticipants) {
      event.status = 'full';
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('hostId', 'fullName profileImage averageRating email')
      .populate('participants', 'fullName profileImage');

    // Get user info for notifications
    const participantUser = await User.findById(user.userId);

    // Create notification for host
    await Notification.create({
      user: event.hostId,
      type: 'friend_joined_event',
      title: 'New Participant',
      message: `${participantUser?.fullName} joined your event: ${event.eventName}`,
      relatedUser: user.userId,
      relatedEvent: event._id,
      isRead: false,
    });

    // Send email to host
    if (updatedEvent?.hostId && typeof updatedEvent.hostId === 'object' && 'email' in updatedEvent.hostId) {
      const hostEmail = (updatedEvent.hostId as any).email;
      if (hostEmail) {
        try {
          await sendEmail({
            to: hostEmail,
            subject: 'Someone Joined Your Event',
            html: generateEmailTemplate('event_joined', {
              participantName: participantUser?.fullName || 'Someone',
              eventName: event.eventName,
              eventId: event._id.toString(),
            }),
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }
    }

    // Create activity
    await Activity.create({
      userId: user.userId,
      type: 'event_joined',
      relatedEvent: event._id,
      message: `${participantUser?.fullName} joined ${event.eventName}`,
    });

    return NextResponse.json({
      message: 'Successfully joined event after payment verification',
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
