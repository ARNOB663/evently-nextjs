import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { uploadImage } from '@/lib/utils/cloudinary';

// POST /api/upload - Upload image to Cloudinary
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'events-platform';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    console.log('📤 Starting image upload to Cloudinary...');
    const result = await uploadImage(file, folder);
    console.log('✅ Image uploaded successfully:', result.secure_url);

    return NextResponse.json(
      {
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url,
        publicId: result.public_id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Failed to upload image';
    let statusCode = 500;
    
    if (error.message?.includes('Cloudinary configuration') || error.message?.includes('missing')) {
      errorMessage = error.message; // Show the actual error message for debugging
      statusCode = 503; // Service Unavailable
    } else if (error.message?.includes('authentication') || error.http_code === 401) {
      errorMessage = 'Cloudinary authentication failed. Please check your API credentials.';
      statusCode = 503;
    } else if (error.message?.includes('Invalid image') || error.http_code === 400) {
      errorMessage = error.message;
      statusCode = 400;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

