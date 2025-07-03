import { LanguageServiceClient, protos } from '@google-cloud/language';
const { Type } = protos.google.cloud.language.v1.Document;

const client = new LanguageServiceClient();

export const moderateText = async (text: string): Promise<boolean> => {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Skipping advanced moderation.');
    // Fallback to basic moderation or throw an error
    return true; // For now, assume safe if advanced moderation is not configured
  }

  try {
    const document = {
      content: text,
      type: Type.PLAIN_TEXT,
    };

    // Detects the sentiment of the text
    const [sentimentResult] = await client.analyzeSentiment({ document: document });
    const sentiment = sentimentResult.documentSentiment;
    const score = sentimentResult.documentSentiment?.score || 0;

    // Detects categories of the text
    const [classificationResult] = await client.classifyText({ document: document });
    const categories = classificationResult.categories || [];

    // Basic moderation logic: if sentiment is very negative or certain categories are detected
    if (score < -0.5) { // Example threshold for negative sentiment
      console.log('Content flagged due to negative sentiment.');
      return false;
    }

    // Example: Flag content if it falls into certain harmful categories
    const harmfulCategories = ['/Adult', '/Violence', '/Hate Speech'];
    for (const category of categories) {
      if (harmfulCategories.some(hc => category.name?.startsWith(hc))) {
        console.log(`Content flagged due to harmful category: ${category.name}`);
        return false;
      }
    }

    return true; // Content is considered safe
  } catch (error) {
    console.error('Error during advanced moderation with Google Cloud Natural Language API:', error);
    // Fallback to basic moderation or assume safe on error
    return true; // For now, assume safe on error
  }
};
