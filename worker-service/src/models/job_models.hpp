#pragma once

#include <string>
#include <vector>

struct CommandResult {
    std::string output;
    int exitCode;
    bool timedOut;
    bool outOfMemory;
};

struct TestCase {
    std::string input;
    std::string expectedOutput;
};

struct JobConfig {
    std::string jobId;
    std::string code;
    std::string language;
    int timeLimitMs;
    int memoryLimitMb;
    std::vector<TestCase> testCases;
};

struct TestCaseExecutionResult {
    std::string output;
    int exitCode;
    std::string status;
};

struct ExecutionResult {
    std::string jobId;
    std::string status;
    std::vector<TestCaseExecutionResult> testCases;
};
