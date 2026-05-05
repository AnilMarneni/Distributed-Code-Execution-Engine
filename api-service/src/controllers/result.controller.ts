import { Request, Response } from 'express';
import { resultService } from '../services/result.service';

export const getJobResult = async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const result = resultService.getResult(jobId);

  if (!result) {
    return res.status(404).json({
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: 'Result not found or job still processing'
      }
    });
  }

  return res.status(200).json({
    status: 'success',
    data: result
  });
};
