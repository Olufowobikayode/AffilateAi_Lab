import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import OpenAI from 'openai';
import { postToFacebookPage } from './facebookService';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface ImagePromptInput {
  target_demographics: any;
  trend_topic: string;
  pod_design_concept: string;
  facebook_post_text: string;
  facebook_ad_copy: string;
}

export async function generateImagePrompt(data: ImagePromptInput): Promise<string> {
  const prompt = `As an AI image prompt engineering expert, your task is to generate a vivid and effective prompt for a free-tier AI image generation API. The image must be visually striking, photorealistic, and perfectly align with the Print on Demand (PoD) design aesthetic: '${data.pod_design_concept}'.\n\n**Crucially, the image needs to be culturally appropriate, relatable, and highly appealing to the specified target audience:** ${JSON.stringify(data.target_demographics)}.\n\nThe image should tastefully incorporate subtle digital security elements (e.g., blockchain visuals, secure lock icons, digital shields, encrypted data motifs) where relevant to the content\'s theme. Ensure the prompt leads to an image with **no watermarks** and is suitable for **commercial use**.\n\n---\n\n**Contextual Information (for inspiration and relevance):**\n* **Trend Theme:** ${data.trend_topic}\n* **Facebook Post Text (for tone and detail):** ${data.facebook_post_text}\n* **Ad Copy (for key messaging):** ${data.facebook_ad_copy}\n\n---\n\n**Output Format:**\nProvide **only the concise and clear image generation prompt string** as output. Do not include any other text or JSON formatting.`

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini for image prompt:', error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-2", // or "dall-e-3" if you have access and prefer it
      prompt: prompt,
      n: 1,
      size: "1024x1024", // or "512x512", "256x256"
    });
    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error("DALL-E API did not return a valid image URL.");
    }
    return response.data[0].url as string;
  } catch (error) {
    console.error('Error calling DALL-E image generation API:', error);
    throw error;
  }
}

export async function uploadImageToCloudinary(imageUrl: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'pod_bot_images',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function uploadImageToFacebook(pageId: string, accessToken: string, imageUrl: string, message: string): Promise<any> {
  try {
    const response = await postToFacebookPage(pageId, accessToken, message, imageUrl);
    return response;
  } catch (error) {
    console.error('Error uploading to Facebook:', error);
    throw error;
  }
}