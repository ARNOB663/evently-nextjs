import { NextRequest, NextResponse } from 'next/server';
import { testCloudinaryConnection } from '@/lib/utils/cloudinary';

// GET /api/test-cloudinary - Test Cloudinary connection
export async function GET(req: NextRequest) {
  try {
    const isConnected = await testCloudinaryConnection();
    
    if (isConnected) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Cloudinary connection successful!' 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary connection failed. Please check your configuration.' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Test Cloudinary error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to test Cloudinary connection' 
      },
      { status: 500 }
    );
  }
}

