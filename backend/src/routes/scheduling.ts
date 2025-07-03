import { Router } from 'express';
import { schedulePost } from '../services/schedulingService';

const router = Router();

router.post('/schedule-post', async (req, res) => {
  try {
    const post = req.body; // Assuming the request body contains the post object
    await schedulePost(post);
    res.status(200).json({ message: 'Post scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

export default router;
