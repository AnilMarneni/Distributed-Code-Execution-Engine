#pragma once

#include "../models/job_models.hpp"
#include "../executor/executor.hpp"
#include "../utils/logger.hpp"
#include <fstream>
#include <filesystem>
#include <memory>
#include <vector>

namespace fs = std::filesystem;

class JobHandler {
public:
    JobHandler(std::unique_ptr<IExecutor> executor) : executor_(std::move(executor)) {
        fs::create_directories("temp");
    }

    ExecutionResult handle(const JobConfig& config) {
        Logger::log(LogLevel::INFO, config.jobId, "Handling job for language: " + config.language + " with " + std::to_string(config.testCases.size()) + " test cases");
        
        std::string ext = getExtension(config.language);
        std::string sourceFilePath = "temp/" + config.jobId + "." + ext;
        
        ExecutionResult result;
        result.jobId = config.jobId;

        try {
            // 1. Write source code to file
            writeCodeToFile(sourceFilePath, config.code);
            
            // 2. Iterate over test cases
            for (const auto& tc : config.testCases) {
                CommandResult cmdRes = executor_->execute(config, sourceFilePath, tc.input);
                
                TestCaseExecutionResult tcRes;
                tcRes.output = cmdRes.output;
                tcRes.exitCode = cmdRes.exitCode;
                
                if (cmdRes.timedOut) {
                    tcRes.status = "timeout";
                } else if (cmdRes.outOfMemory) {
                    tcRes.status = "memory_limit_exceeded";
                } else if (cmdRes.exitCode == 10) {
                    tcRes.status = "compilation_error";
                } else if (cmdRes.exitCode == 0) {
                    tcRes.status = "success";
                } else {
                    tcRes.status = "runtime_error";
                }
                
                result.testCases.push_back(tcRes);

                // Optimization: if compilation error, stop further test cases
                if (tcRes.status == "compilation_error") {
                    break;
                }
            }
            
            result.status = "completed";
            Logger::log(LogLevel::INFO, config.jobId, "Job processed all test cases");

        } catch (const std::exception& e) {
            Logger::log(LogLevel::ERROR, config.jobId, "Error handling job: " + std::string(e.what()));
            result.status = "system_error";
        }

        // Cleanup
        if (fs::exists(sourceFilePath)) {
            fs::remove(sourceFilePath);
        }
        
        return result;
    }

private:
    std::unique_ptr<IExecutor> executor_;

    std::string getExtension(const std::string& lang) {
        if (lang == "python") return "py";
        if (lang == "cpp") return "cpp";
        if (lang == "java") return "java";
        return "txt";
    }

    void writeCodeToFile(const std::string& path, const std::string& code) {
        std::ofstream outFile(path);
        if (!outFile) {
            throw std::runtime_error("Failed to create source file: " + path);
        }
        outFile << code;
        outFile.close();
    }
};
