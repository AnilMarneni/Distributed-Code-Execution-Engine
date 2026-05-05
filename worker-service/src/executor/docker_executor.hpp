#pragma once

#include "executor.hpp"
#include "../utils/logger.hpp"
#include <iostream>
#include <array>
#include <memory>
#include <sstream>
#include <filesystem>
#include <cstdio>
#include <fstream>

namespace fs = std::filesystem;

class DockerExecutor : public IExecutor {
public:
    CommandResult execute(const JobConfig& config, const std::string& filePath, const std::string& input = "") override {
        std::string absPath = fs::absolute(filePath).string();
        
        // Handle input via temp file
        std::string inputFilePath = "temp/" + config.jobId + "_input.txt";
        {
            std::ofstream inputOut(inputFilePath);
            inputOut << input;
        }
        std::string absInputPath = fs::absolute(inputFilePath).string();

        std::string dockerCmd = buildDockerCommand(config, absPath, absInputPath);
        
        Logger::log(LogLevel::DEBUG, config.jobId, "Executing Docker command for test case");
        
        CommandResult result = runSystemCommand(dockerCmd);
        
        // Analyze exit code
        if (result.exitCode == 124) {
            result.timedOut = true;
        } else if (result.exitCode == 137) {
            result.outOfMemory = true;
        }

        // Cleanup input file
        if (fs::exists(inputFilePath)) {
            fs::remove(inputFilePath);
        }
        
        return result;
    }

private:
    std::string buildDockerCommand(const JobConfig& config, const std::string& absPath, const std::string& absInputPath) {
        float timeLimitSec = static_cast<float>(config.timeLimitMs) / 1000.0f;
        std::string memLimitStr = std::to_string(config.memoryLimitMb) + "m";
        std::stringstream ss;
        
        // We use -i and redirect from a mounted file inside bash to avoid shell escaping nightmares
        ss << "docker run --rm -i --network none --memory " << memLimitStr 
           << " --memory-swap " << memLimitStr;

        if (config.language == "python") {
            ss << " -v \"" << absPath << ":/app/main.py:ro\""
               << " -v \"" << absInputPath << ":/app/input.txt:ro\""
               << " python:3.9-slim bash -c \"ulimit -u 50 -f 10000; timeout " << timeLimitSec << "s python3 /app/main.py < /app/input.txt\"";
        } else if (config.language == "cpp") {
            ss << " -v \"" << absPath << ":/app/main.cpp:ro\""
               << " -v \"" << absInputPath << ":/app/input.txt:ro\""
               << " gcc:latest bash -c \"ulimit -u 50 -f 10000; g++ /app/main.cpp -o /tmp/main || exit 10; timeout " 
               << timeLimitSec << "s /tmp/main < /app/input.txt\"";
        } else if (config.language == "java") {
            ss << " -v \"" << absPath << ":/app/Main.java:ro\""
               << " -v \"" << absInputPath << ":/app/input.txt:ro\""
               << " eclipse-temurin:11-jdk bash -c \"ulimit -u 50 -f 10000; javac /app/Main.java -d /tmp || exit 10; timeout " 
               << timeLimitSec << "s java -cp /tmp Main < /app/input.txt\"";
        }
        
        return ss.str();
    }

    CommandResult runSystemCommand(const std::string& cmd) {
        std::array<char, 128> buffer;
        std::string output;
        std::string full_cmd = cmd + " 2>&1";
        
        FILE* pipe = _popen(full_cmd.c_str(), "r");
        if (!pipe) {
            throw std::runtime_error("popen() failed!");
        }
        
        try {
            while (fgets(buffer.data(), buffer.size(), pipe) != nullptr) {
                output += buffer.data();
            }
        } catch (...) {
            _pclose(pipe);
            throw;
        }
        
        int exitCode = _pclose(pipe);
        return {output, exitCode, false, false};
    }
};
