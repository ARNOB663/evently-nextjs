import mongoose, { Schema, Document, Model } from 'mongoose';
import './User';

export interface IEmailVerification extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const EmailVerificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const EmailVerification: Model<IEmailVerification> =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);

export default EmailVerification;

