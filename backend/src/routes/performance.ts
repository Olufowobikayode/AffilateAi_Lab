import { Router } from 'express';
import { getMockPerformanceData } from '../services/performanceService';
import { analyzePerformance } from '../services/optimizationService';

const router = Router();

router.get('/performance/data', (req, res) => {
  try {
    const data = getMockPerformanceData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

router.post('/performance/optimize', async (req, res) => {
  try {
    const performanceData = req.body.performance_data; // Expecting performance data

    // Call Gemini API for optimization analysis
    const optimizationResults = await analyzePerformance(performanceData);
    res.json(optimizationResults);
  } catch (error) {
    console.error('Error optimizing performance:', error);
    res.status(500).json({ error: 'Failed to optimize performance' });
  }
});

export default router;