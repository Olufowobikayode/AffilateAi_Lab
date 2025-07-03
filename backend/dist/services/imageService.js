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
exports.generateImagePrompt = generateImagePrompt;
exports.generateImage = generateImage;
exports.uploadImageToCloudinary = uploadImageToCloudinary;
exports.uploadImageToFacebook = uploadImageToFacebook;
const generative_ai_1 = require("@google/generative-ai");
const cloudinary_1 = require("cloudinary");
const openai_1 = __importDefault(require("openai"));
const facebookService_1 = require("./facebookService");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});
function generateImagePrompt(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `As an AI image prompt engineering expert, your task is to generate a vivid and effective prompt for a free-tier AI image generation API. The image must be visually striking, photorealistic, and perfectly align with the Print on Demand (PoD) design aesthetic: '${data.pod_design_concept}'.\n\n**Crucially, the image needs to be culturally appropriate, relatable, and highly appealing to the specified target audience:** ${JSON.stringify(data.target_demographics)}.\n\nThe image should tastefully incorporate subtle digital security elements (e.g., blockchain visuals, secure lock icons, digital shields, encrypted data motifs) where relevant to the content\'s theme. Ensure the prompt leads to an image with **no watermarks** and is suitable for **commercial use**.\n\n---\n\n**Contextual Information (for inspiration and relevance):**\n* **Trend Theme:** ${data.trend_topic}\n* **Facebook Post Text (for tone and detail):** ${data.facebook_post_text}\n* **Ad Copy (for key messaging):** ${data.facebook_ad_copy}\n\n---\n\n**Output Format:**\nProvide **only the concise and clear image generation prompt string** as output. Do not include any other text or JSON formatting.`;
        try {
            const result = yield geminiModel.generateContent(prompt);
            const response = yield result.response;
            const text = response.text();
            return text;
        }
        catch (error) {
            console.error('Error calling Gemini for image prompt:', error);
            throw error;
        }
    });
}
function generateImage(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield openai.images.generate({
                model: "dall-e-2", // or "dall-e-3" if you have access and prefer it
                prompt: prompt,
                n: 1,
                size: "1024x1024", // or "512x512", "256x256"
            });
            if (!response.data || !response.data[0] || !response.data[0].url) {
                throw new Error("DALL-E API did not return a valid image URL.");
            }
            return response.data[0].url;
        }
        catch (error) {
            console.error('Error calling DALL-E image generation API:', error);
            throw error;
        }
    });
}
function uploadImageToCloudinary(imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield cloudinary_1.v2.uploader.upload(imageUrl, {
                folder: 'pod_bot_images',
            });
            return result.secure_url;
        }
        catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    });
}
function uploadImageToFacebook(pageId, accessToken, imageUrl, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, facebookService_1.postToFacebookPage)(pageId, accessToken, message, imageUrl);
            return response;
        }
        catch (error) {
            console.error('Error uploading to Facebook:', error);
            throw error;
        }
    });
}
