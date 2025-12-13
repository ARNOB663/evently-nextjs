import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';
import './Event';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type:
    | 'friend_request'
    | 'friend_accepted'
    | 'event_joined'
    | 'event_created'
    | 'event_cancelled'
    | 'review_posted'
    | 'became_host';
  relatedUser?: mongoose.Types.ObjectId;
  relatedEvent?: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'friend_request',
        'friend_accepted',
        'event_joined',
        'event_created',
        'event_cancelled',
        'review_posted',
        'became_host',
      ],
      required: true,
    },
    relatedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedEvent: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;

