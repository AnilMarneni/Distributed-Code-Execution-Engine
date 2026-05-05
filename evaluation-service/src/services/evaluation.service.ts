import { JobPayload, JobResult, TestCaseResult, RawWorkerResult } from '@engine/common';

export class EvaluationService {
  public static evaluate(job: JobPayload, workerResult: RawWorkerResult): JobResult {
    const testCaseResults: TestCaseResult[] = job.testCases.map((tc, index) => {
      const workerTC = workerResult.testCases[index];
      let status: 'AC' | 'WA' | 'TLE' | 'RTE' | 'CE' = 'RTE';
      
      if (!workerTC) {
        // This could happen if execution stopped early (e.g. compilation error)
        return {
          input: tc.input,
          output: '',
          expectedOutput: tc.expectedOutput,
          status: 'RTE',
          executionTime: 0,
          memoryUsed: 0
        };
      }

      if (workerTC.status === 'timeout') {
        status = 'TLE';
      } else if (workerTC.status === 'compilation_error') {
        status = 'CE';
      } else if (workerTC.status === 'success') {
        const actual = workerTC.output.trim();
        const expected = tc.expectedOutput.trim();
        status = actual === expected ? 'AC' : 'WA';
      }

      return {
        input: tc.input,
        output: workerTC.output,
        expectedOutput: tc.expectedOutput,
        status,
        executionTime: 0, 
        memoryUsed: 0     
      };
    });

    return {
      jobId: job.jobId,
      status: testCaseResults.every(r => r.status === 'AC') ? 'SUCCESS' : 'FAILED',
      testCaseResults
    };
  }
}
