import { Router } from 'express';
import { generateReply } from '../services/engagementService';

const router = Router();

router.post('/engagement/reply', async (req, res) => {
  try {
    const data = req.body; // Expecting the EngagementInput structure
    const reply = await generateReply(data);
    res.json(reply);
  } catch (error) {
    console.error('Error in /engagement/reply route:', error);
    res.status(500).json({ error: 'Failed to generate reply' });
  }
});

export default router;
