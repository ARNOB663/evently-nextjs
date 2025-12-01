import { NextRequest, NextResponse } from 'next/server';

// GET /api/check-cloudinary - Check if Cloudinary env vars are loaded
export async function GET(req: NextRequest) {
  try {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const config = {
      hasUrl: !!cloudinaryUrl,
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      cloudName: cloudName || 'Not set',
      apiKey: apiKey ? `${apiKey.substring(0, 5)}...` : 'Not set',
      apiSecret: apiSecret ? 'Set (hidden)' : 'Not set',
    };

    const allSet = (cloudinaryUrl || (cloudName && apiKey && apiSecret));

    return NextResponse.json(
      {
        configured: allSet,
        config,
        message: allSet 
          ? '✅ Cloudinary environment variables are loaded correctly'
          : '❌ Cloudinary environment variables are missing. Please check your .env.local file and restart the server.',
      },
      { status: allSet ? 200 : 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { 
        configured: false,
        error: error.message || 'Failed to check Cloudinary configuration'
      },
      { status: 500 }
    );
  }
}

