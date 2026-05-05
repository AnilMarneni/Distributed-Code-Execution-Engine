import { Router } from 'express';
import { submitJob } from '../controllers/submission.controller';
import { getJobResult } from '../controllers/result.controller';
import { submissionRateLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

// POST /submit
router.post('/submit', submissionRateLimiter, submitJob);

// GET /results/:jobId
router.get('/results/:jobId', getJobResult);

export default router;
