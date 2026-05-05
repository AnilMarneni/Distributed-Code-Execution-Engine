import { z } from 'zod';

export const SubmissionSchema = z.object({
  language: z.enum(['cpp', 'python', 'java'], {
    errorMap: () => ({ message: "Supported languages are: cpp, python, java" })
  }),
  code: z.string().min(1, "Source code cannot be empty").max(100000, "Code size limit exceeded"),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string()
  })).min(1, "At least one test case is required"),
  timeLimit: z.number().int().min(100).max(10000).default(2000), // in ms
  memoryLimit: z.number().int().min(16).max(512).default(128), // in MB
});

export type SubmissionRequest = z.infer<typeof SubmissionSchema>;

export interface JobPayload extends SubmissionRequest {
  jobId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  submittedAt: string;
}

export interface TestCaseResult {
  input: string;
  output: string;
  expectedOutput: string;
  status: 'AC' | 'WA' | 'TLE' | 'RTE' | 'CE';
  executionTime: number;
  memoryUsed: number;
}

export interface JobResult {
  jobId: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'ERROR';
  testCaseResults: TestCaseResult[];
}

export interface RawTestCaseResult {
  output: string;
  exitCode: number;
  status: string;
}

export interface RawWorkerResult {
  jobId: string;
  testCases: RawTestCaseResult[];
}

export interface EvaluationPayload {
  job: JobPayload;
  workerResult: RawWorkerResult;
}
