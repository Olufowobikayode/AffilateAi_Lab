import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface PerformanceData {
  facebook_insights_summary: {
    total_reach: number;
    total_engagement: number;
    total_link_clicks: number;
    follower_growth: number;
    performance_by_demographic: any;
    performance_by_post_type: any;
  };
  pod_sales_data: {
    total_sales_count: number;
    total_revenue: number;
    top_selling_designs_by_demographic_and_region: any;
    link_click_to_conversion_rate: number;
  };
  affiliate_performance: {
    total_affiliate_clicks: number;
    estimated_affiliate_revenue: number;
  };
  sponsored_post_revenue: number;
  posts_published_recent: Array<{
    post_id: string;
    content_text_sample: string;
    image_style_description: string;
    trend_topic: string;
    target_demographics: any;
    engagement_rate: number;
    pod_link_clicks: number;
    sales_from_post: number;
  }>;
}

interface OptimizationOutput {
  overall_assessment: string;
  key_insights: string[];
  actionable_recommendations: string[];
  monetization_report: string;
}

export async function analyzePerformance(data: PerformanceData): Promise<OptimizationOutput> {
  // TODO: Implement actual data fetching for pod_sales_data, affiliate_performance, and sponsored_post_revenue
  // This would involve querying your database, integrating with e-commerce platforms (e.g., Shopify API),
  // affiliate marketing platforms, or ad revenue tracking systems.
  // For example:
  // const actualPodSalesData = await fetchSalesDataFromDatabase();
  // const actualAffiliatePerformance = await fetchAffiliateDataFromTrackingSystem();
  // const actualSponsoredPostRevenue = await fetchSponsoredPostRevenue();

  const prompt = `As a data-driven digital marketing strategist focused on rapid growth, your task is to perform a deep analysis of the provided recent performance data. The goal is to continuously optimize our bot's strategy to maximize sales, followers, and engagement, driving towards **1,000,000 combined metrics within the one-month timeframe.**\n\nYou must identify clear patterns, actionable insights, and specific iterative improvements. Your analysis should be segmented by:\n* Content type (e.g., post, ad)\n* Print on Demand (PoD) design\n* Targeted demographics\n* Global regions\n\n---\n\n**Recent Performance Data (JSON format, containing all collected metrics):**\n${JSON.stringify(data, null, 2)}\n\n---\n\n**Output Format:**\nProvide the output as a **JSON object** with the following fields:\n{\n  "overall_assessment": "string (a concise, high-level summary of recent performance and progress towards goal)",\n  "key_insights": "array of strings (e.g., 'Content targeting Gen Z in Brazil consistently yields 2x higher engagement.', 'Minimalist designs performed best for older demographics in Europe.', 'Posts with localized statistics show a 15% higher click-through rate.')",\n  "actionable_recommendations": "array of strings (specific steps for the next iteration, e.g., 'Increase frequency of posts on X topic for Y demographic by 50%.', 'Experiment with Z ad copy and image style for Q region.', 'Optimize Q call-to-action for R sales funnel stage.', 'Develop 5 new PoD designs specifically for the Nigerian youth market, leveraging recent slang.', 'Allocate more content to organic reach in regions with high untapped potential.')",\n  "monetization_report": "string (a concise summary of recent revenue trends, affiliate link performance, and any observed sponsored post potential, segmented by top-performing demographics/regions)"\n}`

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as OptimizationOutput;
  } catch (error) {
    console.error('Error calling Gemini API for performance analysis:', error);
    throw error;
  }
}