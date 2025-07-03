import { Router } from 'express';
import { performTrendFusion } from '../services/trendFusionService';
import Joi from 'joi';
import { validate } from '../middleware/validation';

const router = Router();

const trendFusionSchema = Joi.object({
  target_demographics: Joi.object({
    age_range: Joi.string().required(),
    gender: Joi.string().required(),
    locations: Joi.array().items(Joi.string()).required(),
    interests: Joi.array().items(Joi.string()).required(),
  }).required(),
});

router.post('/trends/fusion', validate(trendFusionSchema), async (req, res, next) => {
  try {
    const targetDemographics = req.body.target_demographics;
    const trends = await performTrendFusion(targetDemographics);
    res.json(trends);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
});

export default router;