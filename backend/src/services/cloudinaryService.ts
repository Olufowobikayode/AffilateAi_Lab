import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (imagePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(imagePath);
    return result.public_id;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image with public ID: ${publicId}`);
  } catch (error) {
    console.error(`Error deleting image ${publicId} from Cloudinary:`, error);
    throw error;
  }
};

export const getImagesOlderThan = async (hours: number): Promise<string[]> => {
  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500, // Adjust as needed
      direction: 'asc',
      start_at: cutoff.toISOString(),
    });

    return result.resources.map((resource: any) => resource.public_id);
  } catch (error) {
    console.error(`Error fetching images older than ${hours} hours from Cloudinary:`, error);
    throw error;
  }
};
