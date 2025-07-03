import cron from 'node-cron';
import { deleteImage, getImagesOlderThan } from '../services/cloudinaryService';

const IMAGE_RETENTION_HOURS = 1; // Images older than 1 hour will be deleted

export const scheduleImageCleanup = () => {
  // Schedule to run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled image cleanup job...');
    try {
      const publicIdsToDelete = await getImagesOlderThan(IMAGE_RETENTION_HOURS);
      if (publicIdsToDelete.length > 0) {
        console.log(`Found ${publicIdsToDelete.length} images to delete.`);
        for (const publicId of publicIdsToDelete) {
          await deleteImage(publicId);
        }
        console.log('Image cleanup job completed.');
      } else {
        console.log('No images found to delete.');
      }
    } catch (error) {
      console.error('Error during image cleanup job:', error);
    }
  });
};
