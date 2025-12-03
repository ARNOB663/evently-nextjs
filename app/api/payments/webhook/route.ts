import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Payment from '@/lib/models/Payment';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Find payment record
      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (!payment) {
        console.error('Payment not found for session:', session.id);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Only process if payment is successful
      if (session.payment_status === 'paid') {
        // Update payment status
        payment.status = 'completed';
        payment.stripePaymentIntentId = session.payment_intent as string;
        await payment.save();

        // Add user to event participants
        const eventDoc = await Event.findById(payment.eventId);
        if (eventDoc && !eventDoc.participants.includes(payment.userId as any)) {
          eventDoc.participants.push(payment.userId as any);
          eventDoc.currentParticipants += 1;

          // Update status if full
          if (eventDoc.currentParticipants >= eventDoc.maxParticipants) {
            eventDoc.status = 'full';
          }

          await eventDoc.save();
        }

        console.log('Payment completed successfully:', session.id);
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Find payment by session ID from metadata or payment intent
      const payment = await Payment.findOne({
        $or: [
          { stripePaymentIntentId: paymentIntent.id },
          { stripeSessionId: paymentIntent.metadata?.session_id },
        ],
      });

      if (payment && payment.status === 'pending') {
        payment.status = 'completed';
        payment.stripePaymentIntentId = paymentIntent.id;
        await payment.save();

        // Add user to event participants
        const eventDoc = await Event.findById(payment.eventId);
        if (eventDoc && !eventDoc.participants.includes(payment.userId as any)) {
          eventDoc.participants.push(payment.userId as any);
          eventDoc.currentParticipants += 1;

          if (eventDoc.currentParticipants >= eventDoc.maxParticipants) {
            eventDoc.status = 'full';
          }

          await eventDoc.save();
        }
      }
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;

      // Find payment by payment intent
      const payment = await Payment.findOne({
        stripePaymentIntentId: charge.payment_intent as string,
      });

      if (payment) {
        payment.status = 'refunded';
        payment.refundedAmount = (charge.amount_refunded || 0) / 100; // Convert from cents
        await payment.save();

        // Remove user from event participants
        const eventDoc = await Event.findById(payment.eventId);
        if (eventDoc) {
          eventDoc.participants = eventDoc.participants.filter(
            (id) => id.toString() !== payment.userId.toString()
          );
          eventDoc.currentParticipants = Math.max(0, eventDoc.currentParticipants - 1);

          // Update status if it was full
          if (eventDoc.status === 'full' && eventDoc.currentParticipants < eventDoc.maxParticipants) {
            eventDoc.status = 'open';
          }

          await eventDoc.save();
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

