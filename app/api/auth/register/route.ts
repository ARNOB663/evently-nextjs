import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import EmailVerification from '@/lib/models/EmailVerification';
import { hashPassword, generateToken } from '@/lib/utils/auth';
import { sendEmail } from '@/lib/utils/email';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/middleware/rateLimit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = checkRateLimit(req, RATE_LIMIT_CONFIGS.register);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await connectDB();

    const body = await req.json();
    const { email, password, fullName, role = 'user' } = body;

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Strong password validation: 8+ chars, uppercase, lowercase, number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const sanitizedRole = role === 'admin' ? 'user' : role;
    const socialDefaults = {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      website: '',
    };

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role: sanitizedRole,
      profileImage: '',
      coverImage: '',
      bio: '',
      interests: [],
      preferredEventTypes: [],
      location: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: '',
      occupation: '',
      company: '',
      website: '',
      socialMediaLinks: socialDefaults,
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    await EmailVerification.create({
      userId: user._id,
      token: verificationToken,
      expiresAt,
    });

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyLink = `${baseUrl}/verify-email?token=${verificationToken}`;
    const { generateEmailTemplate } = await import('@/lib/utils/email');

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Welcome to Evently - Verify Your Email',
      html: generateEmailTemplate('welcome', {
        fullName: user.fullName,
        verifyLink,
      }),
    });

    // Log if email sending failed (but don't fail registration)
    if (!emailSent) {
      console.warn('⚠️  Failed to send verification email, but user registration succeeded');
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
      bio: user.bio,
      interests: user.interests,
      preferredEventTypes: user.preferredEventTypes,
      location: user.location,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      company: user.company,
      website: user.website,
      socialMediaLinks: user.socialMediaLinks,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
    };

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userResponse,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}

