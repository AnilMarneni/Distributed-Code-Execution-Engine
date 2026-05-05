import { Router } from 'express';
import { submitJob } from '../controllers/submission.controller';
import { getJobResult } from '../controllers/result.controller';
import { submissionRateLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

/**
 * @openapi
 * /api/v1/submit:
 *   post:
 *     summary: Submit a code execution job
 *     description: Submit code, language, and test cases for sandboxed execution and evaluation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [cpp, python, java]
 *               testCases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: string
 *                     expectedOutput:
 *                       type: string
 *     responses:
 *       202:
 *         description: Job accepted and queued
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Security violation (AI scanner)
 */
router.post('/submit', submissionRateLimiter, submitJob);

/**
 * @openapi
 * /api/v1/results/{jobId}:
 *   get:
 *     summary: Get job result
 *     description: Fetch the current status and results of a previously submitted job.
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job result returned
 *       404:
 *         description: Job not found
 */
router.get('/results/:jobId', getJobResult);

export default router;
