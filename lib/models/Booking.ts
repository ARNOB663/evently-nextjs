import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';
import './Event';

export interface IAttendee {
  name: string;
  email: string;
  ticketType: string;
}

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  ticketType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountApplied: number;
  discountType?: string;
  attendees: IAttendee[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  paymentId?: mongoose.Types.ObjectId;
  qrCode?: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendeeSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  ticketType: { type: String, required: true },
});

const BookingSchema: Schema = new Schema(
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
    ticketType: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['group', 'early_bird', 'promo', null],
    },
    attendees: [AttendeeSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    qrCode: {
      type: String,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
BookingSchema.index({ userId: 1, eventId: 1 });
BookingSchema.index({ eventId: 1, status: 1 });
BookingSchema.index({ qrCode: 1 });
BookingSchema.index({ createdAt: -1 });

// Calculate group discount
BookingSchema.statics.calculateGroupDiscount = function (quantity: number, unitPrice: number) {
  // 10% discount for 5+ tickets, 15% for 10+ tickets
  let discountPercent = 0;
  if (quantity >= 10) {
    discountPercent = 15;
  } else if (quantity >= 5) {
    discountPercent = 10;
  }

  const subtotal = quantity * unitPrice;
  const discount = subtotal * (discountPercent / 100);
  const total = subtotal - discount;

  return {
    subtotal,
    discountPercent,
    discountAmount: discount,
    total,
  };
};

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
