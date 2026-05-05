import { Router } from 'express';
import { submitJob } from '../controllers/submission.controller';
import { getJobResult } from '../controllers/result.controller';

const router = Router();

// POST /submit
router.post('/submit', submitJob);

// GET /results/:jobId
router.get('/results/:jobId', getJobResult);

export default router;
