import { Router } from 'express';
import { generateImagePrompt, generateImage, uploadImageToCloudinary, uploadImageToFacebook } from '../services/imageService';

const router = Router();

router.post('/images/generate-and-upload', async (req, res) => {
  try {
    const { target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy, pageId, accessToken, message } = req.body; 

    // 1. Generate image prompt using Gemini
    const imagePrompt = await generateImagePrompt({ target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy });

    // 2. Generate image using the prompt
    const imageUrl = await generateImage(imagePrompt);

    // 3. Upload image to Cloudinary
    const cloudinaryUrl = await uploadImageToCloudinary(imageUrl);

    // 4. Upload image to Facebook
    const facebookUploadResult = await uploadImageToFacebook(pageId, accessToken, imageUrl, message);

    res.json({ 
      imagePrompt, 
      generatedImageUrl: imageUrl, 
      cloudinaryUrl, 
      facebookUploadResult 
    });

  } catch (error) {
    console.error('Error in /images/generate-and-upload route:', error);
    res.status(500).json({ error: 'Failed to generate and upload image' });
  }
});

export default router;
