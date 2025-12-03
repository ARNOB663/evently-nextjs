import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';

export interface IEvent extends Document {
  hostId: mongoose.Types.ObjectId;
  eventName: string;
  eventType: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  joiningFee: number;
  image?: string;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host ID is required'],
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [100, 'Event name cannot exceed 100 characters'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: undefined,
    },
    longitude: {
      type: Number,
      default: undefined,
    },
    minParticipants: {
      type: Number,
      required: [true, 'Minimum participants is required'],
      min: [1, 'Minimum participants must be at least 1'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: [1, 'Maximum participants must be at least 1'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    joiningFee: {
      type: Number,
      required: [true, 'Joining fee is required'],
      min: [0, 'Joining fee cannot be negative'],
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'full', 'cancelled', 'completed'],
      default: 'open',
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
EventSchema.index({ hostId: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ location: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ createdAt: -1 });

// Virtual to check if event is full
EventSchema.virtual('isFull').get(function (this: IEvent) {
  return this.currentParticipants >= this.maxParticipants;
});

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

