import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';
import './Event';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  stripeSessionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  refundedAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      uppercase: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
    },
    refundedAmount: {
      type: Number,
      min: 0,
    },
    refundReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ hostId: 1, createdAt: -1 });
PaymentSchema.index({ eventId: 1 });
PaymentSchema.index({ status: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

