import { Router } from 'express';
import { generateContent } from '../services/openaiService';
import { postToFacebookPage } from '../services/facebookService';

const router = Router();

router.post('/content/generate', async (req, res) => {
  try {
    const data = req.body; // Expecting the ContentGenerationInput structure
    const generatedContent = await generateContent(data);

    // Moderation check removed as moderationService is deprecated.
    // Consider implementing moderation using Gemini's safety features or OpenAI's moderation API.

    // Assuming pageId and accessToken are provided in the request body for now
    // In a real app, these would be securely retrieved (e.g., from a database)
    const { pageId, accessToken } = req.body;

    if (!pageId || !accessToken) {
      return res.status(400).json({ error: 'pageId and accessToken are required for posting to Facebook' });
    }

    // Post to Facebook
    await postToFacebookPage(pageId, accessToken, generatedContent.facebook_post_text);

    res.json(generatedContent);
  } catch (error) {
    console.error('Error in /content/generate route:', error);
    res.status(500).json({ error: 'Failed to generate content or post to Facebook' });
  }
});

export default router;