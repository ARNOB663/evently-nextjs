import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, hashPassword } from '@/lib/utils/auth';

interface GoogleTokenResponse {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

// GET /api/auth/google/callback - handle Google OAuth callback
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.error('Google OAuth env vars missing');
    return NextResponse.redirect(
      `${baseUrl}/login?error=google_config`
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      `${baseUrl}/login?error=google_cancelled`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=google_no_code`
    );
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    if (!tokenRes.ok || tokenData.error) {
      console.error('Google token error:', tokenData);
      return NextResponse.redirect(
        `${baseUrl}/login?error=google_token`
      );
    }

    if (!tokenData.access_token) {
      console.error('No access token from Google:', tokenData);
      return NextResponse.redirect(
        `${baseUrl}/login?error=google_no_access`
      );
    }

    // Fetch user info
    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;

    if (!userInfoRes.ok || !userInfo.email) {
      console.error('Failed to fetch Google user info:', userInfo);
      return NextResponse.redirect(
        `${baseUrl}/login?error=google_userinfo`
      );
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ email: userInfo.email.toLowerCase() });

    if (!user) {
      const randomPassword = `google_${userInfo.sub}_${Date.now()}`;
      const hashedPassword = await hashPassword(randomPassword);

      user = await User.create({
        email: userInfo.email.toLowerCase(),
        password: hashedPassword,
        fullName:
          userInfo.name ||
          `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() ||
          'Google User',
        profileImage: userInfo.picture || '',
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
        socialMediaLinks: {
          instagram: '',
          twitter: '',
          facebook: '',
          linkedin: '',
          website: '',
        },
        role: 'user',
        emailVerified: userInfo.email_verified ?? true,
        emailVerifiedAt: new Date(),
      });
    } else if (!user.emailVerified) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userPayload = {
      _id: user._id.toString(),
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
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const encodedUser = encodeURIComponent(
      Buffer.from(JSON.stringify(userPayload)).toString('base64')
    );

    // Redirect back to login so client can store token and user
    return NextResponse.redirect(
      `${baseUrl}/login?social=google&token=${encodeURIComponent(
        token
      )}&user=${encodedUser}`
    );
  } catch (e) {
    console.error('Google callback error:', e);
    return NextResponse.redirect(
      `${baseUrl}/login?error=google_internal`
    );
  }
}


