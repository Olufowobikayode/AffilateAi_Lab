import { GoogleGenerativeAI } from '@google/generative-ai';
import { postCommentReply } from './facebookService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface EngagementInput {
  user_name: string;
  user_demographics: any;
  comment_text: string;
  comment_id: string;
}

interface EngagementOutput {
  comment_id: string;
  reply_text: string;
}

export async function generateReply(data: EngagementInput): Promise<EngagementOutput> {
  const prompt = `As an empathetic social media engagement specialist, your task is to generate a natural, concise, and contextually relevant reply to a Facebook comment. This reply should foster further discussion and improve post visibility.\n\nThe user, named '${data.user_name}', left the following comment on one of our bot's posts/ads. The content focuses on Print on Demand and digital security, and the user's inferred demographics are: ${JSON.stringify(data.user_demographics)}.\n\n---\n\n**User Comment:** '${data.comment_text}'\n\n---\n\n**Reply Requirements:**\n* The reply should be no more than **3 sentences**.\n* Directly address the user's point or question.\n* Tailor the tone and content to resonate with the user's inferred demographics (e.g., use culturally appropriate phrasing if applicable).\n* Encourage further interaction (e.g., ask another related question).\n\n---\n\n**Output Format:**\nProvide the output as a **JSON object** with the following fields:\n{\n  "comment_id": "[COMMENT_ID]",\n  "reply_text": "string (the generated reply text)"\n}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const replyData = JSON.parse(text) as EngagementOutput;

    // Post the reply to Facebook
    // You'll need to pass the page access token here. For simplicity, assuming it's available via env or a lookup.
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN; // You need to get this token
    if (pageAccessToken) {
      await postCommentReply(replyData.comment_id, pageAccessToken, replyData.reply_text);
      console.log(`Replied to comment ${replyData.comment_id}`);
    } else {
      console.warn('FACEBOOK_PAGE_ACCESS_TOKEN not set. Cannot post reply to Facebook.');
    }

    return replyData;
  } catch (error) {
    console.error('Error calling Gemini API for engagement reply:', error);
    throw error;
  }
}