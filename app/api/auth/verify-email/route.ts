import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import EmailVerification from '@/lib/models/EmailVerification';
import crypto from 'crypto';

// POST /api/auth/verify-email - Request email verification
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Delete any existing verification tokens
    await EmailVerification.deleteMany({ userId: user._id, verified: false });

    // Create new verification token
    await EmailVerification.create({
      userId: user._id,
      token,
      expiresAt,
    });

    // Send verification email
    const { sendEmail, generateEmailTemplate } = await import('@/lib/utils/email');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyLink = `${baseUrl}/verify-email?token=${token}`;

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Evently',
      html: generateEmailTemplate('email_verification', {
        verifyLink,
      }),
    });

    if (!emailSent) {
      console.warn('⚠️  Failed to send verification email');
    }

    return NextResponse.json(
      {
        message: 'Verification email sent',
        ...(process.env.NODE_ENV === 'development' && { verifyLink }),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

// GET /api/auth/verify-email - Verify email with token
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find valid verification token
    const verification = await EmailVerification.findOne({
      token,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await User.findByIdAndUpdate(verification.userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    // Mark verification as verified
    verification.verified = true;
    await verification.save();

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    );
  }
}

