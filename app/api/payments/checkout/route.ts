import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Payment from '@/lib/models/Payment';
import { requireAuth } from '@/lib/middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

// POST /api/payments/checkout - Create Stripe checkout session
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Get event details
    const event = await Event.findById(eventId).populate('hostId', 'fullName email');
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event has a joining fee
    if (event.joiningFee <= 0) {
      return NextResponse.json({ error: 'This event is free' }, { status: 400 });
    }

    // Check if user is already a participant
    if (event.participants.includes(user.userId as any)) {
      return NextResponse.json({ error: 'You are already a participant' }, { status: 400 });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    // Check if event is open
    if (event.status !== 'open') {
      return NextResponse.json({ error: `Event is ${event.status}` }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: event.eventName,
              description: `Joining fee for ${event.eventName}`,
            },
            unit_amount: Math.round(event.joiningFee * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events/${eventId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events/${eventId}?payment=cancelled`,
      client_reference_id: eventId,
      metadata: {
        userId: user.userId,
        eventId: eventId,
        hostId: event.hostId._id.toString(),
      },
    });

    // Create payment record
    await Payment.create({
      userId: user.userId,
      eventId: eventId,
      hostId: event.hostId._id,
      amount: event.joiningFee,
      currency: 'usd',
      stripePaymentIntentId: session.id, // Using session ID temporarily
      stripeSessionId: session.id,
      status: 'pending',
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

