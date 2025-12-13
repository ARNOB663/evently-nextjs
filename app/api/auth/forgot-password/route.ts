import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import PasswordReset from '@/lib/models/PasswordReset';
import { sendEmail, generateEmailTemplate } from '@/lib/utils/email';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/middleware/rateLimit';
import crypto from 'crypto';

// POST /api/auth/forgot-password - Request password reset
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = checkRateLimit(req, RATE_LIMIT_CONFIGS.forgotPassword);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await connectDB();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generic success message to prevent user enumeration
    const successResponse = {
      message: 'If an account with that email exists, a password reset OTP has been sent.',
      emailSent: true,
    };

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Return same response whether user exists or not (prevents enumeration)
    if (!user) {
      // Still return success to prevent email enumeration attacks
      return NextResponse.json(successResponse, { status: 200 });
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

    // Send password reset email with OTP (don't expose email failure to client)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - Evently',
        html: generateEmailTemplate('password_reset_otp', {
          otp,
          fullName: user.fullName,
        }),
      });
    } catch (emailError) {
      // Log error but don't expose to client
      console.error('Failed to send password reset email');
    }

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

