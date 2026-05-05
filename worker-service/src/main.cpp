#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <cstdio>
#include <memory>
#include <stdexcept>
#include <array>
#include "../include/httplib.h"
#include "../include/json.hpp"

using json = nlohmann::json;

struct CommandResult {
    std::string output;
    int exitCode;
};

CommandResult execute_command(const std::string& cmd) {
    std::array<char, 128> buffer;
    std::string result;
    // Redirect stderr to stdout to capture errors
    std::string full_cmd = cmd + " 2>&1";
    
    // In Windows popen returns the exit code via pclose
    FILE* pipe = popen(full_cmd.c_str(), "r");
    if (!pipe) {
        throw std::runtime_error("popen() failed!");
    }
    
    while (fgets(buffer.data(), buffer.size(), pipe) != nullptr) {
        result += buffer.data();
    }
    
    int status = pclose(pipe);
    return {result, status};
}

std::string escape_for_shell(const std::string& code) {
    std::string escaped = code;
    size_t pos = 0;
    while ((pos = escaped.find("\"", pos)) != std::string::npos) {
        escaped.replace(pos, 1, "\\\"");
        pos += 2;
    }
    // Also escape backslashes for Python
    pos = 0;
    while ((pos = escaped.find("\\", pos)) != std::string::npos) {
        // Only escape if it's not already escaped or part of a valid escape sequence
        // For simplicity in MVP, we'll just double them
        escaped.replace(pos, 1, "\\\\");
        pos += 2;
    }
    return escaped;
}

#include <filesystem>
namespace fs = std::filesystem;

int main() {
    httplib::Server svr;

    // Ensure temp directory exists
    fs::create_directories("temp");

    svr.Post("/execute", [](const httplib::Request& req, httplib::Response& res) {
        std::string jobId = "unknown";
        std::string tempFilePath = "";
        try {
            auto j = json::parse(req.body);
            std::string code = j["code"];
            std::string language = j["language"];
            jobId = j["jobId"];
            int timeLimitMs = j.value("timeLimit", 2000);
            int memoryLimitMb = j.value("memoryLimit", 128);

            std::cout << "Received job " << jobId << " (Language: " << language << ")" << std::endl;

            std::string ext = (language == "python") ? "py" : (language == "cpp") ? "cpp" : "java";
            tempFilePath = "temp/" + jobId + "." + ext;
            
            // Write code to file
            std::ofstream outFile(tempFilePath);
            outFile << code;
            outFile.close();

            // Get absolute path for Docker volume mounting
            std::string absPath = fs::absolute(tempFilePath).string();
            
            float timeLimitSec = static_cast<float>(timeLimitMs) / 1000.0f;
            std::stringstream timeLimitStr;
            timeLimitStr << timeLimitSec;
            std::string memLimitStr = std::to_string(memoryLimitMb) + "m";

            CommandResult cmdRes;
            std::string status = "success";
            std::string dockerCmd = "";

            if (language == "python") {
                dockerCmd = "docker run --rm --network none --memory " + memLimitStr + 
                            " --memory-swap " + memLimitStr + 
                            " -v \"" + absPath + ":/app/main.py:ro\" " +
                            " python:3.9-slim timeout " + timeLimitStr.str() + "s python3 /app/main.py";
            } else if (language == "cpp") {
                dockerCmd = "docker run --rm --network none --memory " + memLimitStr + 
                            " --memory-swap " + memLimitStr + 
                            " -v \"" + absPath + ":/app/main.cpp:ro\" " +
                            " gcc:latest bash -c \"g++ /app/main.cpp -o /tmp/main || exit 10; timeout " + timeLimitStr.str() + "s /tmp/main\"";
            } else if (language == "java") {
                dockerCmd = "docker run --rm --network none --memory " + memLimitStr + 
                            " --memory-swap " + memLimitStr + 
                            " -v \"" + absPath + ":/app/Main.java:ro\" " +
                            " eclipse-temurin:11-jdk bash -c \"javac /app/Main.java -d /tmp || exit 10; timeout " + timeLimitStr.str() + "s java -cp /tmp Main\"";
            }

            if (!dockerCmd.empty()) {
                std::cout << "Executing: " << dockerCmd << std::endl;
                cmdRes = execute_command(dockerCmd);

                if (cmdRes.exitCode == 10) {
                    status = "compilation_error";
                } else if (cmdRes.exitCode == 124) {
                    status = "timeout";
                } else if (cmdRes.exitCode == 137) {
                    status = "memory_limit_exceeded";
                } else if (cmdRes.exitCode != 0) {
                    status = "error";
                }
            } else {
                cmdRes.output = "Language not supported yet";
                status = "error";
            }

            json result;
            result["status"] = status;
            result["output"] = cmdRes.output;
            result["jobId"] = jobId;
            result["exitCode"] = cmdRes.exitCode;

            res.set_content(result.dump(), "application/json");

            // Clean up
            fs::remove(tempFilePath);

        } catch (const std::exception& e) {
            if (!tempFilePath.empty()) fs::remove(tempFilePath);
            json err;
            err["status"] = "error";
            err["message"] = e.what();
            err["jobId"] = jobId;
            res.status = 500;
            res.set_content(err.dump(), "application/json");
        }
    });

    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content("{\"status\":\"UP\"}", "application/json");
    });

    std::cout << "Worker Service starting on port 4000..." << std::endl;
    svr.listen("0.0.0.0", 4000);

    return 0;
}
