import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer ID is required'],
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host ID is required'],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ hostId: 1 });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ eventId: 1 });
ReviewSchema.index({ createdAt: -1 });

// Ensure one review per user per event
ReviewSchema.index({ reviewerId: 1, eventId: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

