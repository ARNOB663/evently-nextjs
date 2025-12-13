import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';
import './Event';

export interface IEventPhoto extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventPhotoSchema: Schema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EventPhotoSchema.index({ eventId: 1, createdAt: -1 });
EventPhotoSchema.index({ userId: 1 });

const EventPhoto: Model<IEventPhoto> =
  mongoose.models.EventPhoto || mongoose.model<IEventPhoto>('EventPhoto', EventPhotoSchema);

export default EventPhoto;

