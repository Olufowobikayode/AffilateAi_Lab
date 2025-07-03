import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import Joi from 'joi';
import { getGoogleTrends, getGoogleDailyTrends } from '../services/googleTrendsService';
import { getRankedTrends } from '../services/geminiService';
import { generateContent } from '../services/openaiService';
import { generateImagePrompt, generateImage, uploadImageToCloudinary, uploadImageToFacebook } from '../services/imageService';
import { insertTrend as saveTrend } from '../repositories/trendRepository';
import { insertPost as savePost } from '../repositories/postRepository';
import { insertComment as saveComment, getUnrepliedComments, updateCommentReply } from '../repositories/commentRepository';
import { generateReply } from '../services/engagementService';
import { analyzePerformance } from '../services/optimizationService';

import { getSubredditHotPosts } from '../services/redditService';
import { getDemographicTrends, getEventsData, getFinanceNews, getEcommerceProductData, getNicheData, getAdditionalSocialMediaTrends } from '../services/dataSources';
import { getPageInsights } from '../services/facebookService';
import { scheduleImageCleanup } from '../jobs/imageCleanupJob';
import { processScheduledPosts } from '../services/schedulingService';

// Redis connection for BullMQ
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Define Queues
export const trendQueue = new Queue('trendProcessing', { connection });
export const contentQueue = new Queue('contentGeneration', { connection });
export const imageQueue = new Queue('imageProcessing', { connection });
export const engagementQueue = new Queue('engagementProcessing', { connection });
export const performanceQueue = new Queue('performanceAnalysis', { connection });
export const scheduledPostsQueue = new Queue('scheduledPosts', { connection });

// Joi Schemas for Job Data Validation
const trendProcessingSchema = Joi.object({
  targetDemographics: Joi.object({
    age_range: Joi.string().required(),
    gender: Joi.string().required(),
    locations: Joi.array().items(Joi.string()).required(),
    interests: Joi.array().items(Joi.string()).required(),
  }).required(),
  niches: Joi.array().items(Joi.string()).optional(),
  ecommercePlatforms: Joi.array().items(Joi.string()).optional(),
  financeKeywords: Joi.array().items(Joi.string()).optional(),
});

const contentGenerationSchema = Joi.object({
  target_demographics: Joi.object().required(),
  trend_topic: Joi.string().required(),
  pod_design_concept: Joi.string().required(),
  list_of_hashtags_from_gemini_and_others: Joi.array().items(Joi.string()).required(),
});

const imageProcessingSchema = Joi.object({
  target_demographics: Joi.object().required(),
  trend_topic: Joi.string().required(),
  pod_design_concept: Joi.string().required(),
  facebook_post_text: Joi.string().required(),
  facebook_ad_copy: Joi.string().required(),
  pageId: Joi.string().required(),
  accessToken: Joi.string().required(),
  message: Joi.string().required(),
  postId: Joi.number().required(),
});

const engagementProcessingSchema = Joi.object({
  commentId: Joi.string().required(),
  postId: Joi.number().required(),
  userName: Joi.string().required(),
  userDemographics: Joi.object().required(),
  commentText: Joi.string().required(),
});

const performanceAnalysisSchema = Joi.object({
  mockPerformanceData: Joi.object().required(),
});

const scheduledPostsSchema = Joi.object({
  // Define schema for scheduled posts job data if any
});

// Define Workers
export function startWorkers() {
  const defaultWorkerOptions = {
    connection,
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: { type: 'exponential', delay: 1000 }, // Exponential backoff starting at 1 second
  };

  // Trend Processing Worker
  const trendWorker = new Worker('trendProcessing', async (job) => {
    console.log('Processing trend job:', job.data);
    const { error } = trendProcessingSchema.validate(job.data);
    if (error) {
      console.error('Trend Processing Job Validation Error:', error.details);
      throw new Error(error.details[0].message);
    }

    const { targetDemographics, niches, ecommercePlatforms, financeKeywords } = job.data;

    // Fetch data from various sources
    let facebookInsights = {};
    try {
      const demoTrends = await getDemographicTrends(targetDemographics);
      facebookInsights = demoTrends.facebook_demographics;
    } catch (e) { console.error('Failed to get Facebook Insights:', e); throw e; }

    let googleTrendsData = {};
    try {
      googleTrendsData = await getGoogleTrends({ keyword: ['print on demand'], geo: targetDemographics.locations[0] || 'US' });
    } catch (e) { console.error('Failed to get Google Trends data:', e); throw e; }

    let redditTrends = {};
    try {
      redditTrends = await getSubredditHotPosts('printondemand', 10);
    } catch (e) { console.error('Failed to get Reddit trends:', e); throw e; }

    let eventsData = {};
    try {
      eventsData = await getEventsData(targetDemographics.locations[0] || 'Global');
    } catch (e) { console.error('Failed to get events data:', e); throw e; }

    let financeNews = {};
    try {
      financeNews = await getFinanceNews(financeKeywords || ['economy', 'market']);
    } catch (e) { console.error('Failed to get finance news:', e); throw e; }

    let ecommerceData: { [key: string]: any } = {};
    if (ecommercePlatforms && ecommercePlatforms.length > 0) {
      for (const platform of ecommercePlatforms) {
        try {
          const data = await getEcommerceProductData(platform, 't-shirt');
          ecommerceData = { ...ecommerceData, ...data };
        } catch (e) { console.error(`Failed to get e-commerce data from ${platform}:`, e); throw e; }
      }
    }

    let nicheData: { [key: string]: any } = {};
    if (niches && niches.length > 0) {
      for (const niche of niches) {
        try {
          const data = await getNicheData(niche);
          nicheData = { ...nicheData, ...data };
        } catch (e) { console.error(`Failed to get niche data for ${niche}:`, e); throw e; }
      }
    }

    let additionalSocialTrends = {};
    try {
      additionalSocialTrends = await getAdditionalSocialMediaTrends();
    } catch (e) { console.error('Failed to get additional social media trends:', e); throw e; }

    const trendFusionInput = {
      age_range: targetDemographics.age_range,
      gender: targetDemographics.gender,
      locations: targetDemographics.locations,
      interests: targetDemographics.interests,
      facebook_insights: facebookInsights,
      google_trends: googleTrendsData,
      reddit_trends: redditTrends,
      scraped_social_trends: { ...eventsData, ...financeNews, ...additionalSocialTrends, ...nicheData },
      scraped_ecommerce_pod_data: ecommerceData,
    };

    const rankedTrends = await getRankedTrends(trendFusionInput);
    console.log('Ranked Trends:', rankedTrends);

    for (const trend of rankedTrends.ranked_trends) {
      await saveTrend(trend);
      if (rankedTrends.ranked_trends.indexOf(trend) < 3) {
        await contentQueue.add('generateContent', {
          target_demographics: trend.target_demographics,
          trend_topic: trend.topic,
          pod_design_concept: trend.pod_design_concepts[0],
          list_of_hashtags_from_gemini_and_others: trend.suggested_hashtags,
        });
      }
    }
  }, defaultWorkerOptions);

  trendWorker.on('failed', (job, err) => {
    console.error(`Trend Processing Job ${job?.id} failed: ${err.message}`);
    // TODO: Implement dead-letter queue logic or alert system
  });

  // Content Generation Worker
  const contentWorker = new Worker('contentGeneration', async (job) => {
    console.log('Processing content generation job:', job.data);
    const { error } = contentGenerationSchema.validate(job.data);
    if (error) {
      console.error('Content Generation Job Validation Error:', error.details);
      throw new Error(error.details[0].message);
    }
    const generatedContent = await generateContent(job.data);
    console.log('Generated Content:', generatedContent);

    // Save the generated content as a Post
    const newPost = await savePost({
      trend_topic: generatedContent.trend_topic,
      pod_design_concept: generatedContent.pod_design_concept,
      facebook_post_text: generatedContent.facebook_post_text,
      facebook_ad_copy: generatedContent.facebook_ad_copy,
      hashtags: generatedContent.hashtags,
      affiliate_link_potential: generatedContent.affiliate_link_potential,
      sponsored_post_suitability: generatedContent.sponsored_post_suitability,
    });

    if (!newPost) {
      console.error('Failed to save new post.');
      throw new Error('Failed to save new post.');
    }

    // Add image generation job, passing the newPost ID
    await imageQueue.add('generateAndUploadImage', {
      target_demographics: job.data.target_demographics,
      trend_topic: job.data.trend_topic,
      pod_design_concept: generatedContent.pod_design_concept,
      facebook_post_text: generatedContent.facebook_post_text,
      facebook_ad_copy: generatedContent.facebook_ad_copy,
      pageId: process.env.FACEBOOK_PAGE_ID, 
      accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      message: generatedContent.facebook_post_text, // Use post text as message for Facebook upload
      postId: newPost[0].id, // Pass the post ID
    }, { attempts: defaultWorkerOptions.attempts, backoff: defaultWorkerOptions.backoff });

    // TODO: Implement post scheduling algorithm for optimal reach
  }, defaultWorkerOptions);

  contentWorker.on('failed', (job, err) => {
    console.error(`Content Generation Job ${job?.id} failed: ${err.message}`);
    // TODO: Implement dead-letter queue logic or alert system
  });

  // Image Processing Worker
  new Worker('imageProcessing', async (job) => {
    console.log('Processing image generation and upload job:', job.data);
    const { error } = imageProcessingSchema.validate(job.data);
    if (error) {
      console.error('Image Processing Job Validation Error:', error.details);
      throw new Error(error.details[0].message);
    }
    const { target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy, pageId, accessToken, message, postId } = job.data;

    const imagePrompt = await generateImagePrompt({ target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy });
    const imageUrl = await generateImage(imagePrompt);
    const cloudinaryUrl = await uploadImageToCloudinary(imageUrl);
    const facebookUploadResult = await uploadImageToFacebook(pageId, accessToken, imageUrl, message);

    console.log('Image Processed:', { cloudinaryUrl, facebookUploadResult });

    // Update the saved post with image URLs and Facebook post ID
    if (postId) {
      await savePost({
        id: postId,
        image_url: imageUrl,
        cloudinary_url: cloudinaryUrl,
        facebook_post_id: facebookUploadResult.id, // Assuming Facebook API returns an 'id'
      });
    }
  }, defaultWorkerOptions);

  // Engagement Processing Worker
  const engagementWorker = new Worker('engagementProcessing', async (job) => {
    console.log('Processing engagement job:', job.data);
    const { error } = engagementProcessingSchema.validate(job.data);
    if (error) {
      console.error('Engagement Processing Job Validation Error:', error.details);
      throw new Error(error.details[0].message);
    }
    const { commentId, postId, userName, userDemographics, commentText } = job.data;

    // Save the incoming comment to the database
    const newComment = await saveComment({
      facebook_comment_id: commentId,
      post_id: postId,
      user_name: userName,
      user_demographics: userDemographics,
      comment_text: commentText,
    });

    if (!newComment) {
      console.error('Failed to save new comment.');
      throw new Error('Failed to save new comment.');
    }

    const reply = await generateReply({
      comment_id: newComment[0].facebook_comment_id,
      user_name: newComment[0].user_name,
      user_demographics: newComment[0].user_demographics,
      comment_text: newComment[0].comment_text,
    });
    console.log('Generated Reply:', reply);

    // Update the comment in the database with the reply
    await updateCommentReply(newComment[0].id!, reply.reply_text);

    // TODO: Implement logic to post the reply back to Facebook
  }, defaultWorkerOptions);

  engagementWorker.on('failed', (job, err) => {
    console.error(`Engagement Processing Job ${job?.id} failed: ${err.message}`);
    // TODO: Implement dead-letter queue logic or alert system
  });

  // Performance Analysis Worker
  const performanceWorker = new Worker('performanceAnalysis', async (job) => {
    console.log('Processing performance analysis job:', job.data);
    const { error } = performanceAnalysisSchema.validate(job.data);
    if (error) {
      console.error('Performance Analysis Job Validation Error:', error.details);
      throw new Error(error.details[0].message);
    }
    const { mockPerformanceData } = job.data;

    let facebookInsightsSummary = {};
    try {
      const demoTrends = await getDemographicTrends({});
      facebookInsightsSummary = demoTrends.facebook_demographics;
    } catch (e) { console.error('Failed to get Facebook Insights for performance analysis:', e); throw e; }

    // TODO: Fetch actual sales, affiliate, sponsored post data from your database/tracking

    const actualPerformanceData = {
      ...mockPerformanceData,
      facebook_insights_summary: facebookInsightsSummary,
    };

    const analysis = await analyzePerformance(actualPerformanceData);
    console.log('Performance Analysis:', analysis);
    // TODO: Store analysis results, potentially trigger alerts or reports
  }, defaultWorkerOptions);

  performanceWorker.on('failed', (job, err) => {
    console.error(`Performance Analysis Job ${job?.id} failed: ${err.message}`);
    // TODO: Implement dead-letter queue logic or alert system
  });

  // Scheduled Posts Worker
  const scheduledPostsWorker = new Worker('scheduledPosts', async job => {
    console.log(`Processing scheduled post job ${job.id} of type ${job.name}`);
    const { error } = scheduledPostsSchema.validate(job.data);
    if (error) {
      console.error('Scheduled Posts Job Validation Error:', error.details);
      throw new Error(error.details[0].message);
    }
    if (job.name === 'publishPost') {
      await processScheduledPosts(job.data); // Pass job.data to processScheduledPosts
    }
  }, defaultWorkerOptions);

  scheduledPostsWorker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
  });

  scheduledPostsWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
  });

  console.log('BullMQ Workers started.');
}

// Function to add scheduled jobs (replaces node-cron)
export async function setupScheduledJobs() {
  // Trend Fetching: Every 4 hours
  await trendQueue.add('fetchTrends', {
    targetDemographics: {
      age_range: 'all',
      gender: 'all',
      locations: ['Global'],
      interests: ['digital security', 'print on demand'],
    },
    niches: ['gaming', 'sustainability'],
    ecommercePlatforms: ['etsy', 'redbubble'],
    financeKeywords: ['AI', 'blockchain'],
  });

  // Comment Monitoring (This would ideally be webhook-driven, but for scheduled polling):
  // For demonstration, adding a job that runs frequently to check for new comments.
  // In a real scenario, you'd fetch comments for specific posts and then add them to the queue.
  await engagementQueue.add('monitorComments', {
    commentId: 'mock_comment_1',
    postId: 1,
    userName: 'John Doe',
    userDemographics: { age: '30-40' },
    commentText: 'Great post! How can I learn more about digital security?',
  });

  // Performance Tracking & Optimization: Weekly
  await performanceQueue.add('analyzeWeeklyPerformance', {
    mockPerformanceData: {
      facebook_insights_summary: { /* mock data */ },
      pod_sales_data: { /* mock data */ },
      affiliate_performance: { /* mock data */ },
      sponsored_post_revenue: 0,
      posts_published_recent: [],
    },
  });

  console.log('BullMQ Scheduled Jobs setup.');
}