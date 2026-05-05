import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SubmissionSchema, JobPayload } from '@engine/common';
import { kafkaService } from '../services/kafka.service';
import { aiSecurityScanner } from '../services/ai/security-scanner.service';

export const submitJob = async (req: Request, res: Response) => {
  try {
    // 1. Validate input
    const validationResult = SubmissionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid submission data',
          details: validationResult.error.errors
        }
      });
    }

    const submissionData = validationResult.data;

    // 2. AI Security Analysis (Phase 6)
    const securityResult = await aiSecurityScanner.analyze(submissionData.code, submissionData.language);
    if (!securityResult.isSafe) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: 'SECURITY_VIOLATION',
          message: 'Code rejected by AI security scanner',
          reason: securityResult.reason
        }
      });
    }

    // 3. Generate unique job ID
    const jobId = uuidv4();

    // 3. Construct job payload
    const jobPayload: JobPayload = {
      ...submissionData,
      jobId,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    // 4. Push job to queue
    const messageSent = await kafkaService.sendMessage('job_submissions', jobPayload);

    if (!messageSent) {
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'QUEUE_ERROR',
          message: 'Failed to queue the job'
        }
      });
    }

    // 5. Return job ID to client
    return res.status(202).json({
      status: 'success',
      data: {
        jobId
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
};
