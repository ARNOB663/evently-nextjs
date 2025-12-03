import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'friend_request' | 'friend_accepted' | 'profile_visit' | 'friend_joined_event' | 'friend_became_host' | 'event_reminder' | 'message';
  title: string;
  message: string;
  relatedUser?: mongoose.Types.ObjectId;
  relatedEvent?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['friend_request', 'friend_accepted', 'profile_visit', 'friend_joined_event', 'friend_became_host', 'event_reminder', 'message'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    relatedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedEvent: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user notifications
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

