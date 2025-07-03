import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface TrendFusionInput {
  age_range: string;
  gender: string;
  locations: string[];
  interests: string[];
  facebook_insights: any;
  google_trends: any;
  reddit_trends: any;
  scraped_social_trends: any;
  scraped_ecommerce_pod_data: any;
}

interface TrendFusionOutput {
  ranked_trends: Array<{
    topic: string;
    virality_score: number;
    justification: string;
    suggested_hashtags: string[];
    target_demographics: any;
    pod_design_concepts: string[];
  }>;
}

export async function getRankedTrends(data: TrendFusionInput): Promise<TrendFusionOutput> {
  const prompt = `As an expert digital marketing strategist specializing in rapid growth for Print on Demand (PoD) businesses, your task is to analyze the provided raw market data. Identify the **top 3 most viral and commercially viable content trends for PoD**, specifically those with strong resonance for the specified target demographics and global regions.\n\nFor each identified trend, you must:\n1.  Suggest **highly relevant hashtags**, including geo-specific or demographic-specific ones as appropriate for maximum reach.\n2.  Propose **concrete, actionable PoD design concepts** that are explicitly tailored to the audience\'s cultural context, preferences, and current purchasing power.\n\nApply the following weighting system for virality scoring during your analysis:\n* Facebook Insights: 70%\n* Google Trends: 80%\n* Reddit: 50%\n* Other social media/scraped platforms: 60%\n* E-commerce/PoD platforms: 80%\n\n---\n\n**Target Demographic and Geographic Filters for this Analysis:**\n${JSON.stringify({
    age_range: data.age_range,
    gender: data.gender,
    locations: data.locations,
    interests: data.interests,
  }, null, 2)}\n\n---\n\n**Raw Market Data (JSON format, containing data from all fetched sources with relevant metadata):**\n${JSON.stringify({
    facebook_insights: data.facebook_insights,
    google_trends: data.google_trends,
    reddit_trends: data.reddit_trends,
    scraped_social_trends: data.scraped_social_trends,
    scraped_ecommerce_pod_data: data.scraped_ecommerce_pod_data,
  }, null, 2)}\n\n---\n\n**Output Format:**\nProvide the output as a **JSON object** with a \'ranked_trends\' array. Each object in the array MUST have the following structure:\n{\n  "topic": "string",\n  "virality_score": "number (0-1, indicating estimated viral potential)",\n  "justification": "string (brief explanation of why this trend is viral and commercially viable for PoD)",\n  "suggested_hashtags": "array of strings (including relevant geo/demographic hashtags for maximum impact)",\n  "target_demographics": "object (echoing the input filters, or refined by Gemini if more specific insights emerge for this trend)",\n  "pod_design_concepts": "array of strings (specific and actionable ideas, e.g., \'T-shirt for [demographic/region]: [concept]\', \'Mug for [demographic/region]: [concept]\', \'Phone case for [demographic/region]: [concept]\')"\n}`

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as TrendFusionOutput;
  } catch (error) {
    console.error('Error calling Gemini API for trend fusion:', error);
    throw error;
  }
}
