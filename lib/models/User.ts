import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  interests: string[];
  preferredEventTypes?: string[]; // For users - what kind of events they like
  location?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  website?: string;
  socialMediaLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  role: 'user' | 'host' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  averageRating?: number;
  totalReviews?: number;
  // Friend System
  friends: mongoose.Types.ObjectId[];
  friendRequestsSent: mongoose.Types.ObjectId[];
  friendRequestsReceived: mongoose.Types.ObjectId[];
  blockedUsers: mongoose.Types.ObjectId[];
  // Privacy Settings
  privacySettings?: {
    profileVisibility: 'everyone' | 'friends' | 'only me';
    friendRequests: 'everyone' | 'friends of friends' | 'no one';
    showFriendList: boolean;
    showProfileVisits: boolean;
    showOnlineStatus: boolean;
  };
  // Online Status
  lastSeen?: Date;
  isOnline?: boolean;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    interests: {
      type: [String],
      default: [],
    },
    preferredEventTypes: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: '',
    },
    occupation: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    socialMediaLinks: {
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['user', 'host', 'admin'],
      default: 'user',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Friend System
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequestsSent: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequestsReceived: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Privacy Settings
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['everyone', 'friends', 'only me'],
        default: 'everyone',
      },
      friendRequests: {
        type: String,
        enum: ['everyone', 'friends of friends', 'no one'],
        default: 'everyone',
      },
      showFriendList: {
        type: Boolean,
        default: true,
      },
      showProfileVisits: {
        type: Boolean,
        default: true,
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
    },
    // Online Status
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
UserSchema.index({ role: 1 });
UserSchema.index({ interests: 1 });
UserSchema.index({ location: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

