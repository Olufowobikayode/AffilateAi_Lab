import { Queue } from 'bullmq';
import { Post } from '../types/Post';
import { getPageInsights, postToFacebookPage } from './facebookService'; // Assuming this function exists

// Initialize a BullMQ queue for scheduled posts
const scheduledPostsQueue = new Queue('scheduledPosts', {
  connection: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') },
});

const getOptimalPostingTime = async (): Promise<number> => {
  try {
    // In a real application, pageId and accessToken would be retrieved securely
    const pageId = process.env.FACEBOOK_PAGE_ID || 'YOUR_FACEBOOK_PAGE_ID';
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'YOUR_FACEBOOK_ACCESS_TOKEN';

    // Fetch page insights for engagement metrics
    // Assuming 'page_post_engagements' metric provides hourly data
    const insights = await getPageInsights(pageId, accessToken, ['page_post_engagements']);

    // Basic analysis: Find the hour with the highest engagement
    let maxEngagement = -1;
    let optimalHour = new Date().getHours(); // Default to current hour if no data

    if (insights && insights.data && insights.data.length > 0) {
      // This is a simplified example. Real insights data might need more complex parsing.
      // Assuming insights.data[0].values contains hourly data
      const hourlyData = insights.data[0].values;

      for (const dataPoint of hourlyData) {
        // Assuming 'value' is the engagement count and 'end_time' indicates the hour
        const engagement = dataPoint.value;
        const hour = new Date(dataPoint.end_time).getHours();

        if (engagement > maxEngagement) {
          maxEngagement = engagement;
          optimalHour = hour;
        }
      }
    }

    // Calculate delay to reach the optimal hour
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    let delayHours = optimalHour - currentHour;
    if (delayHours < 0) {
      delayHours += 24; // Schedule for next day if optimal hour is in the past today
    }

    // Calculate total delay in milliseconds
    const delayMs = (delayHours * 60 * 60 * 1000) - (currentMinute * 60 * 1000) - (currentSecond * 1000);

    // Ensure a minimum delay (e.g., 1 minute) to avoid immediate processing issues
    return Math.max(delayMs, 60 * 1000); // Minimum 1 minute delay

  } catch (error) {
    console.error('Error determining optimal posting time:', error);
    // Fallback to a default delay if insights fetching or analysis fails
    return 5 * 60 * 1000; // 5 minutes default delay
  }
};

export const schedulePost = async (post: Post): Promise<void> => {
  const delay = await getOptimalPostingTime();
  await scheduledPostsQueue.add('publishPost', post, { delay });
  console.log(`Post scheduled for publication with delay ${delay / (60 * 1000)} minutes: ${post.title || post.id}`);
};

export const processScheduledPosts = async (post: Post) => {
  console.log(`Processing scheduled post: ${post.title || post.id}`);
  try {
    // In a real application, pageId and accessToken would be retrieved securely
    const pageId = process.env.FACEBOOK_PAGE_ID || 'YOUR_FACEBOOK_PAGE_ID';
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'YOUR_FACEBOOK_ACCESS_TOKEN';

    if (!pageId || !accessToken) {
      console.error('Facebook Page ID or Access Token not configured for post publishing.');
      return;
    }

    await postToFacebookPage(pageId, accessToken, post.content, post.imageUrl);
    console.log(`Post published successfully: ${post.title || post.id}`);
    // TODO: Update post status in database (e.g., mark as published)
  } catch (error) {
    console.error(`Error publishing scheduled post ${post.title || post.id}:`, error);
  }
};
