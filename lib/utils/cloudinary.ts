import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Parse Cloudinary URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
function parseCloudinaryUrl(url: string): { apiKey: string; apiSecret: string; cloudName: string } | null {
  try {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      return {
        apiKey: match[1],
        apiSecret: match[2],
        cloudName: match[3],
      };
    }
  } catch (error) {
    console.error('Failed to parse Cloudinary URL:', error);
  }
  return null;
}

// Validate and configure Cloudinary
function configureCloudinary() {
  // First, try to use CLOUDINARY_URL if provided
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    const parsed = parseCloudinaryUrl(cloudinaryUrl);
    if (parsed) {
      // Configure Cloudinary (only if not already configured)
      if (!cloudinary.config().cloud_name) {
        cloudinary.config({
          cloud_name: parsed.cloudName,
          api_key: parsed.apiKey,
          api_secret: parsed.apiSecret,
        });
      }
      console.log('✅ Cloudinary configured from CLOUDINARY_URL');
      return parsed;
    } else {
      console.warn('⚠️ CLOUDINARY_URL found but could not be parsed');
    }
  }

  // Fallback to individual environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Debug logging
  console.log('🔍 Checking Cloudinary environment variables:');
  console.log('  CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
  console.log('  CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
  console.log('  CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    throw new Error(
      `Cloudinary configuration is missing: ${missing.join(', ')}. Please set these in your .env.local file and restart the server.`
    );
  }

  // Configure Cloudinary (only if not already configured)
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log('✅ Cloudinary configured from individual environment variables');
    console.log(`   Cloud Name: ${cloudName}`);
    console.log(`   API Key: ${apiKey.substring(0, 5)}...`);
  } else {
    console.log('✅ Cloudinary already configured');
  }

  return { cloudName, apiKey, apiSecret };
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
}

export async function uploadImage(
  file: File | Buffer | string,
  folder: string = 'events-platform'
): Promise<UploadResult> {
  try {
    // Validate and configure Cloudinary at runtime
    configureCloudinary();
    
    let uploadResult;

    if (typeof file === 'string') {
      // Base64 string
      uploadResult = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'image',
      });
    } else if (file instanceof File) {
      // Convert File to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convert buffer to base64
      const base64 = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64}`;
      
      uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'image',
      });
    } else {
      // Buffer
      const base64 = file.toString('base64');
      const dataURI = `data:image/jpeg;base64,${base64}`;
      
      uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'image',
      });
    }

    return {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      url: uploadResult.url,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('configuration')) {
      throw error; // Re-throw configuration errors as-is
    }
    
    if (error.http_code === 401) {
      throw new Error('Cloudinary authentication failed. Please check your API credentials.');
    }
    
    if (error.http_code === 400) {
      throw new Error(`Invalid image: ${error.message || 'Please check your image file.'}`);
    }
    
    throw new Error(error.message || 'Failed to upload image to Cloudinary. Please try again.');
  }
}

// Test Cloudinary connection
export async function testCloudinaryConnection(): Promise<boolean> {
  try {
    configureCloudinary();
    // Try to ping Cloudinary API
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connection test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Cloudinary connection test failed:', error.message);
    return false;
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    configureCloudinary();
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

