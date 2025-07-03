"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledPostsQueue = exports.performanceQueue = exports.engagementQueue = exports.imageQueue = exports.contentQueue = exports.trendQueue = void 0;
exports.startWorkers = startWorkers;
exports.setupScheduledJobs = setupScheduledJobs;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const joi_1 = __importDefault(require("joi"));
const googleTrendsService_1 = require("../services/googleTrendsService");
const geminiService_1 = require("../services/geminiService");
const openaiService_1 = require("../services/openaiService");
const imageService_1 = require("../services/imageService");
const trendRepository_1 = require("../repositories/trendRepository");
const postRepository_1 = require("../repositories/postRepository");
const commentRepository_1 = require("../repositories/commentRepository");
const engagementService_1 = require("../services/engagementService");
const optimizationService_1 = require("../services/optimizationService");
const redditService_1 = require("../services/redditService");
const dataSources_1 = require("../services/dataSources");
const schedulingService_1 = require("../services/schedulingService");
// Redis connection for BullMQ
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});
// Define Queues
exports.trendQueue = new bullmq_1.Queue('trendProcessing', { connection });
exports.contentQueue = new bullmq_1.Queue('contentGeneration', { connection });
exports.imageQueue = new bullmq_1.Queue('imageProcessing', { connection });
exports.engagementQueue = new bullmq_1.Queue('engagementProcessing', { connection });
exports.performanceQueue = new bullmq_1.Queue('performanceAnalysis', { connection });
exports.scheduledPostsQueue = new bullmq_1.Queue('scheduledPosts', { connection });
// Joi Schemas for Job Data Validation
const trendProcessingSchema = joi_1.default.object({
    targetDemographics: joi_1.default.object({
        age_range: joi_1.default.string().required(),
        gender: joi_1.default.string().required(),
        locations: joi_1.default.array().items(joi_1.default.string()).required(),
        interests: joi_1.default.array().items(joi_1.default.string()).required(),
    }).required(),
    niches: joi_1.default.array().items(joi_1.default.string()).optional(),
    ecommercePlatforms: joi_1.default.array().items(joi_1.default.string()).optional(),
    financeKeywords: joi_1.default.array().items(joi_1.default.string()).optional(),
});
const contentGenerationSchema = joi_1.default.object({
    target_demographics: joi_1.default.object().required(),
    trend_topic: joi_1.default.string().required(),
    pod_design_concept: joi_1.default.string().required(),
    list_of_hashtags_from_gemini_and_others: joi_1.default.array().items(joi_1.default.string()).required(),
});
const imageProcessingSchema = joi_1.default.object({
    target_demographics: joi_1.default.object().required(),
    trend_topic: joi_1.default.string().required(),
    pod_design_concept: joi_1.default.string().required(),
    facebook_post_text: joi_1.default.string().required(),
    facebook_ad_copy: joi_1.default.string().required(),
    pageId: joi_1.default.string().required(),
    accessToken: joi_1.default.string().required(),
    message: joi_1.default.string().required(),
    postId: joi_1.default.number().required(),
});
const engagementProcessingSchema = joi_1.default.object({
    commentId: joi_1.default.string().required(),
    postId: joi_1.default.number().required(),
    userName: joi_1.default.string().required(),
    userDemographics: joi_1.default.object().required(),
    commentText: joi_1.default.string().required(),
});
const performanceAnalysisSchema = joi_1.default.object({
    mockPerformanceData: joi_1.default.object().required(),
});
const scheduledPostsSchema = joi_1.default.object({
// Define schema for scheduled posts job data if any
});
// Define Workers
function startWorkers() {
    const defaultWorkerOptions = {
        connection,
        attempts: 3, // Retry failed jobs up to 3 times
        backoff: { type: 'exponential', delay: 1000 }, // Exponential backoff starting at 1 second
    };
    // Trend Processing Worker
    const trendWorker = new bullmq_1.Worker('trendProcessing', (job) => __awaiter(this, void 0, void 0, function* () {
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
            const demoTrends = yield (0, dataSources_1.getDemographicTrends)(targetDemographics);
            facebookInsights = demoTrends.facebook_demographics;
        }
        catch (e) {
            console.error('Failed to get Facebook Insights:', e);
            throw e;
        }
        let googleTrendsData = {};
        try {
            googleTrendsData = yield (0, googleTrendsService_1.getGoogleTrends)({ keyword: ['print on demand'], geo: targetDemographics.locations[0] || 'US' });
        }
        catch (e) {
            console.error('Failed to get Google Trends data:', e);
            throw e;
        }
        let redditTrends = {};
        try {
            redditTrends = yield (0, redditService_1.getSubredditHotPosts)('printondemand', 10);
        }
        catch (e) {
            console.error('Failed to get Reddit trends:', e);
            throw e;
        }
        let eventsData = {};
        try {
            eventsData = yield (0, dataSources_1.getEventsData)(targetDemographics.locations[0] || 'Global');
        }
        catch (e) {
            console.error('Failed to get events data:', e);
            throw e;
        }
        let financeNews = {};
        try {
            financeNews = yield (0, dataSources_1.getFinanceNews)(financeKeywords || ['economy', 'market']);
        }
        catch (e) {
            console.error('Failed to get finance news:', e);
            throw e;
        }
        let ecommerceData = {};
        if (ecommercePlatforms && ecommercePlatforms.length > 0) {
            for (const platform of ecommercePlatforms) {
                try {
                    const data = yield (0, dataSources_1.getEcommerceProductData)(platform, 't-shirt');
                    ecommerceData = Object.assign(Object.assign({}, ecommerceData), data);
                }
                catch (e) {
                    console.error(`Failed to get e-commerce data from ${platform}:`, e);
                    throw e;
                }
            }
        }
        let nicheData = {};
        if (niches && niches.length > 0) {
            for (const niche of niches) {
                try {
                    const data = yield (0, dataSources_1.getNicheData)(niche);
                    nicheData = Object.assign(Object.assign({}, nicheData), data);
                }
                catch (e) {
                    console.error(`Failed to get niche data for ${niche}:`, e);
                    throw e;
                }
            }
        }
        let additionalSocialTrends = {};
        try {
            additionalSocialTrends = yield (0, dataSources_1.getAdditionalSocialMediaTrends)();
        }
        catch (e) {
            console.error('Failed to get additional social media trends:', e);
            throw e;
        }
        const trendFusionInput = {
            age_range: targetDemographics.age_range,
            gender: targetDemographics.gender,
            locations: targetDemographics.locations,
            interests: targetDemographics.interests,
            facebook_insights: facebookInsights,
            google_trends: googleTrendsData,
            reddit_trends: redditTrends,
            scraped_social_trends: Object.assign(Object.assign(Object.assign(Object.assign({}, eventsData), financeNews), additionalSocialTrends), nicheData),
            scraped_ecommerce_pod_data: ecommerceData,
        };
        const rankedTrends = yield (0, geminiService_1.getRankedTrends)(trendFusionInput);
        console.log('Ranked Trends:', rankedTrends);
        for (const trend of rankedTrends.ranked_trends) {
            yield (0, trendRepository_1.insertTrend)(trend);
            if (rankedTrends.ranked_trends.indexOf(trend) < 3) {
                yield exports.contentQueue.add('generateContent', {
                    target_demographics: trend.target_demographics,
                    trend_topic: trend.topic,
                    pod_design_concept: trend.pod_design_concepts[0],
                    list_of_hashtags_from_gemini_and_others: trend.suggested_hashtags,
                });
            }
        }
    }), defaultWorkerOptions);
    trendWorker.on('failed', (job, err) => {
        console.error(`Trend Processing Job ${job === null || job === void 0 ? void 0 : job.id} failed: ${err.message}`);
        // TODO: Implement dead-letter queue logic or alert system
    });
    // Content Generation Worker
    const contentWorker = new bullmq_1.Worker('contentGeneration', (job) => __awaiter(this, void 0, void 0, function* () {
        console.log('Processing content generation job:', job.data);
        const { error } = contentGenerationSchema.validate(job.data);
        if (error) {
            console.error('Content Generation Job Validation Error:', error.details);
            throw new Error(error.details[0].message);
        }
        const generatedContent = yield (0, openaiService_1.generateContent)(job.data);
        console.log('Generated Content:', generatedContent);
        // Save the generated content as a Post
        const newPost = yield (0, postRepository_1.insertPost)({
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
        yield exports.imageQueue.add('generateAndUploadImage', {
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
    }), defaultWorkerOptions);
    contentWorker.on('failed', (job, err) => {
        console.error(`Content Generation Job ${job === null || job === void 0 ? void 0 : job.id} failed: ${err.message}`);
        // TODO: Implement dead-letter queue logic or alert system
    });
    // Image Processing Worker
    new bullmq_1.Worker('imageProcessing', (job) => __awaiter(this, void 0, void 0, function* () {
        console.log('Processing image generation and upload job:', job.data);
        const { error } = imageProcessingSchema.validate(job.data);
        if (error) {
            console.error('Image Processing Job Validation Error:', error.details);
            throw new Error(error.details[0].message);
        }
        const { target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy, pageId, accessToken, message, postId } = job.data;
        const imagePrompt = yield (0, imageService_1.generateImagePrompt)({ target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy });
        const imageUrl = yield (0, imageService_1.generateImage)(imagePrompt);
        const cloudinaryUrl = yield (0, imageService_1.uploadImageToCloudinary)(imageUrl);
        const facebookUploadResult = yield (0, imageService_1.uploadImageToFacebook)(pageId, accessToken, imageUrl, message);
        console.log('Image Processed:', { cloudinaryUrl, facebookUploadResult });
        // Update the saved post with image URLs and Facebook post ID
        if (postId) {
            yield (0, postRepository_1.insertPost)({
                id: postId,
                image_url: imageUrl,
                cloudinary_url: cloudinaryUrl,
                facebook_post_id: facebookUploadResult.id, // Assuming Facebook API returns an 'id'
            });
        }
    }), defaultWorkerOptions);
    // Engagement Processing Worker
    const engagementWorker = new bullmq_1.Worker('engagementProcessing', (job) => __awaiter(this, void 0, void 0, function* () {
        console.log('Processing engagement job:', job.data);
        const { error } = engagementProcessingSchema.validate(job.data);
        if (error) {
            console.error('Engagement Processing Job Validation Error:', error.details);
            throw new Error(error.details[0].message);
        }
        const { commentId, postId, userName, userDemographics, commentText } = job.data;
        // Save the incoming comment to the database
        const newComment = yield (0, commentRepository_1.insertComment)({
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
        const reply = yield (0, engagementService_1.generateReply)({
            comment_id: newComment[0].facebook_comment_id,
            user_name: newComment[0].user_name,
            user_demographics: newComment[0].user_demographics,
            comment_text: newComment[0].comment_text,
        });
        console.log('Generated Reply:', reply);
        // Update the comment in the database with the reply
        yield (0, commentRepository_1.updateCommentReply)(newComment[0].id, reply.reply_text);
        // TODO: Implement logic to post the reply back to Facebook
    }), defaultWorkerOptions);
    engagementWorker.on('failed', (job, err) => {
        console.error(`Engagement Processing Job ${job === null || job === void 0 ? void 0 : job.id} failed: ${err.message}`);
        // TODO: Implement dead-letter queue logic or alert system
    });
    // Performance Analysis Worker
    const performanceWorker = new bullmq_1.Worker('performanceAnalysis', (job) => __awaiter(this, void 0, void 0, function* () {
        console.log('Processing performance analysis job:', job.data);
        const { error } = performanceAnalysisSchema.validate(job.data);
        if (error) {
            console.error('Performance Analysis Job Validation Error:', error.details);
            throw new Error(error.details[0].message);
        }
        const { mockPerformanceData } = job.data;
        let facebookInsightsSummary = {};
        try {
            const demoTrends = yield (0, dataSources_1.getDemographicTrends)({});
            facebookInsightsSummary = demoTrends.facebook_demographics;
        }
        catch (e) {
            console.error('Failed to get Facebook Insights for performance analysis:', e);
            throw e;
        }
        // TODO: Fetch actual sales, affiliate, sponsored post data from your database/tracking
        const actualPerformanceData = Object.assign(Object.assign({}, mockPerformanceData), { facebook_insights_summary: facebookInsightsSummary });
        const analysis = yield (0, optimizationService_1.analyzePerformance)(actualPerformanceData);
        console.log('Performance Analysis:', analysis);
        // TODO: Store analysis results, potentially trigger alerts or reports
    }), defaultWorkerOptions);
    performanceWorker.on('failed', (job, err) => {
        console.error(`Performance Analysis Job ${job === null || job === void 0 ? void 0 : job.id} failed: ${err.message}`);
        // TODO: Implement dead-letter queue logic or alert system
    });
    // Scheduled Posts Worker
    const scheduledPostsWorker = new bullmq_1.Worker('scheduledPosts', (job) => __awaiter(this, void 0, void 0, function* () {
        console.log(`Processing scheduled post job ${job.id} of type ${job.name}`);
        const { error } = scheduledPostsSchema.validate(job.data);
        if (error) {
            console.error('Scheduled Posts Job Validation Error:', error.details);
            throw new Error(error.details[0].message);
        }
        if (job.name === 'publishPost') {
            yield (0, schedulingService_1.processScheduledPosts)(job.data); // Pass job.data to processScheduledPosts
        }
    }), defaultWorkerOptions);
    scheduledPostsWorker.on('completed', job => {
        console.log(`Job ${job.id} has completed!`);
    });
    scheduledPostsWorker.on('failed', (job, err) => {
        console.error(`Job ${job === null || job === void 0 ? void 0 : job.id} has failed with ${err.message}`);
    });
    console.log('BullMQ Workers started.');
}
// Function to add scheduled jobs (replaces node-cron)
function setupScheduledJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        // Trend Fetching: Every 4 hours
        yield exports.trendQueue.add('fetchTrends', {
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
        yield exports.engagementQueue.add('monitorComments', {
            commentId: 'mock_comment_1',
            postId: 1,
            userName: 'John Doe',
            userDemographics: { age: '30-40' },
            commentText: 'Great post! How can I learn more about digital security?',
        });
        // Performance Tracking & Optimization: Weekly
        yield exports.performanceQueue.add('analyzeWeeklyPerformance', {
            mockPerformanceData: {
                facebook_insights_summary: { /* mock data */},
                pod_sales_data: { /* mock data */},
                affiliate_performance: { /* mock data */},
                sponsored_post_revenue: 0,
                posts_published_recent: [],
            },
        });
        console.log('BullMQ Scheduled Jobs setup.');
    });
}
