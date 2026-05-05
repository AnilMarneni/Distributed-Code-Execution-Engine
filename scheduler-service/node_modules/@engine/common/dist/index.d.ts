import { z } from 'zod';
export declare const SubmissionSchema: z.ZodObject<{
    language: z.ZodEnum<["cpp", "python", "java"]>;
    code: z.ZodString;
    testCases: z.ZodArray<z.ZodObject<{
        input: z.ZodString;
        expectedOutput: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        input: string;
        expectedOutput: string;
    }, {
        input: string;
        expectedOutput: string;
    }>, "many">;
    timeLimit: z.ZodDefault<z.ZodNumber>;
    memoryLimit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    language: "cpp" | "python" | "java";
    code: string;
    testCases: {
        input: string;
        expectedOutput: string;
    }[];
    timeLimit: number;
    memoryLimit: number;
}, {
    language: "cpp" | "python" | "java";
    code: string;
    testCases: {
        input: string;
        expectedOutput: string;
    }[];
    timeLimit?: number | undefined;
    memoryLimit?: number | undefined;
}>;
export type SubmissionRequest = z.infer<typeof SubmissionSchema>;
export interface JobPayload extends SubmissionRequest {
    jobId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    submittedAt: string;
}
export interface JobResult {
    jobId: string;
    status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'ERROR';
    testCaseResults: Array<{
        input: string;
        output: string;
        expectedOutput: string;
        status: 'AC' | 'WA' | 'TLE' | 'RTE' | 'CE';
        executionTime: number;
        memoryUsed: number;
    }>;
}
