import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfileVisit extends Document {
  visitor: mongoose.Types.ObjectId;
  visitedUser: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProfileVisitSchema: Schema = new Schema(
  {
    visitor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for visit queries
ProfileVisitSchema.index({ visitedUser: 1, createdAt: -1 });
ProfileVisitSchema.index({ visitor: 1, visitedUser: 1 });

const ProfileVisit: Model<IProfileVisit> =
  mongoose.models.ProfileVisit || mongoose.model<IProfileVisit>('ProfileVisit', ProfileVisitSchema);

export default ProfileVisit;

