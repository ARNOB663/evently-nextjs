import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import PasswordReset from '@/lib/models/PasswordReset';
import { sendEmail, generateEmailTemplate } from '@/lib/utils/email';
import crypto from 'crypto';

// POST /api/auth/forgot-password - Request password reset
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
      // Explicitly tell client that email is not registered
      return NextResponse.json(
        { error: 'Email not found. Please check and try again.' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry for OTP

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id, used: false });

    // Create new reset record with OTP
    await PasswordReset.create({
      userId: user._id,
      otp,
      expiresAt,
    });

    // Send password reset email with OTP
    console.log('📧 Sending OTP email to:', user.email);
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Evently',
      html: generateEmailTemplate('password_reset_otp', {
        otp,
        fullName: user.fullName,
      }),
    });

    if (!emailSent) {
      console.error('❌ Failed to send password reset email to:', user.email);
      return NextResponse.json(
        {
          error: 'Failed to send email. Please try again later or contact support.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'A password reset OTP has been sent to your email.',
        emailSent: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

