import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import { validateEnv } from './config/envValidation';

validateEnv(); // Validate environment variables

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import trendsRouter from './routes/trends';
import contentRouter from './routes/content';
import imagesRouter from './routes/images';
import engagementRouter from './routes/engagement';
import optimizationRouter from './routes/optimization';
import schedulingRouter from './routes/scheduling';
import performanceRouter from './routes/performance';
import facebookWebhookRouter from './routes/facebook'; // Import the new router
import { startWorkers, setupScheduledJobs } from './queue/index';

const app = express();
const port = process.env.PORT || 3000;

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

app.use(express.json());
app.use(cors());

app.use('/api', trendsRouter);
app.use('/api', contentRouter);
app.use('/api', imagesRouter);
app.use('/api', engagementRouter);
app.use('/api', optimizationRouter);
app.use('/api', schedulingRouter);
app.use('/api', performanceRouter);
app.use('/facebook', facebookWebhookRouter); // Mount Facebook webhook router

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Centralized Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).send({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
  });
});

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  startWorkers();
  setupScheduledJobs();
});