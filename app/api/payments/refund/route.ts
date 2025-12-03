import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Payment from '@/lib/models/Payment';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// POST /api/payments/refund - Process refund
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { paymentId, reason } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Find payment
    const payment = await Payment.findById(paymentId)
      .populate('eventId')
      .populate('userId')
      .populate('hostId');

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check permissions - only host or admin can refund
    if (
      payment.hostId._id.toString() !== user.userId &&
      user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already refunded
    if (payment.status === 'refunded') {
      return NextResponse.json({ error: 'Payment already refunded' }, { status: 400 });
    }

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(payment.amount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundedAmount = payment.amount;
    payment.refundReason = reason || 'Refunded by host';
    await payment.save();

    // Remove user from event participants
    const event = await Event.findById(payment.eventId);
    if (event) {
      event.participants = event.participants.filter(
        (id) => id.toString() !== payment.userId._id.toString()
      );
      event.currentParticipants = Math.max(0, event.currentParticipants - 1);

      // Update status if it was full
      if (event.status === 'full' && event.currentParticipants < event.maxParticipants) {
        event.status = 'open';
      }

      await event.save();
    }

    return NextResponse.json(
      {
        message: 'Refund processed successfully',
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}

