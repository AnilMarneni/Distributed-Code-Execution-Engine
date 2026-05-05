import { JobResult } from '@engine/common';

class ResultService {
  private results: Map<string, JobResult> = new Map();

  setResult(result: JobResult) {
    console.log(`Storing result for job: ${result.jobId}`);
    this.results.set(result.jobId, result);
  }

  getResult(jobId: string): JobResult | undefined {
    return this.results.get(jobId);
  }
}

export const resultService = new ResultService();
