import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import PasswordReset from '@/lib/models/PasswordReset';
import { hashPassword } from '@/lib/utils/auth';

// POST /api/auth/reset-password - Reset password with token
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, otp, password } = body;

    if (!email || !otp || !password) {
      return NextResponse.json(
        { error: 'Email, OTP, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP' },
        { status: 400 }
      );
    }

    // Find valid reset OTP
    const resetToken = await PasswordReset.findOne({
      userId: user._id,
      otp,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Update user password
    const hashedPassword = await hashPassword(password);
    await User.findByIdAndUpdate(resetToken.userId, {
      password: hashedPassword,
    });

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}

