import { Worker } from 'bullmq';
import { scheduleImageCleanup } from './jobs/imageCleanupJob';
import { processScheduledPosts } from './services/schedulingService';

// This file will now only contain specific worker definitions if needed, or be removed if all workers are in index.ts
// For now, keeping it to define the scheduledPostsWorker if it's distinct from the main workers in index.ts

const scheduledPostsWorker = new Worker('scheduledPosts', async job => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  if (job.name === 'publishPost') {
    await processScheduledPosts(job.data);
  }
}, {
  connection: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') },
});

export const setupScheduledJobs = () => {
  console.log('Setting up scheduled jobs...');
  scheduleImageCleanup();
};

export const startSpecificWorkers = () => {
  console.log('Starting specific queue workers...');
  scheduledPostsWorker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
  });

  scheduledPostsWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
  });
};