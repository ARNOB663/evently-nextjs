import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

