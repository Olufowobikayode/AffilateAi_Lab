import { Router } from 'express';
import { analyzePerformance } from '../services/optimizationService';

const router = Router();

router.post('/performance/analyze', async (req, res) => {
  try {
    const data = req.body; // Expecting the PerformanceData structure
    const analysis = await analyzePerformance(data);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /performance/analyze route:', error);
    res.status(500).json({ error: 'Failed to analyze performance' });
  }
});

export default router;
