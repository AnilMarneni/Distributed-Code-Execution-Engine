"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionSchema = void 0;
const zod_1 = require("zod");
exports.SubmissionSchema = zod_1.z.object({
    language: zod_1.z.enum(['cpp', 'python', 'java'], {
        errorMap: () => ({ message: "Supported languages are: cpp, python, java" })
    }),
    code: zod_1.z.string().min(1, "Source code cannot be empty").max(100000, "Code size limit exceeded"),
    testCases: zod_1.z.array(zod_1.z.object({
        input: zod_1.z.string(),
        expectedOutput: zod_1.z.string()
    })).min(1, "At least one test case is required"),
    timeLimit: zod_1.z.number().int().min(100).max(10000).default(2000), // in ms
    memoryLimit: zod_1.z.number().int().min(16).max(512).default(128), // in MB
});
