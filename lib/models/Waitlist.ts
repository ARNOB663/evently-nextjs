import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';
import './Event';

export interface IWaitlist extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  position: number;
  joinedAt: Date;
  notified: boolean;
  notifiedAt?: Date;
  status: 'waiting' | 'offered' | 'accepted' | 'declined' | 'expired';
  offerExpiresAt?: Date;
}

const WaitlistSchema: Schema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      // Index defined via compound index below
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // Index defined via compound index below
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    notified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['waiting', 'offered', 'accepted', 'declined', 'expired'],
      default: 'waiting',
    },
    offerExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique waitlist entry per user per event
WaitlistSchema.index({ eventId: 1, userId: 1 }, { unique: true });
WaitlistSchema.index({ eventId: 1, position: 1 });
WaitlistSchema.index({ status: 1 });

const Waitlist: Model<IWaitlist> =
  mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);

export default Waitlist;
