#include <iostream>
#include <string>
#include <memory>
#include "../include/httplib.h"
#include "../include/json.hpp"
#include "models/job_models.hpp"
#include "executor/docker_executor.hpp"
#include "handler/job_handler.hpp"
#include "utils/logger.hpp"

using json = nlohmann::json;

int main() {
    httplib::Server svr;
    
    // Initialize components
    auto executor = std::make_unique<DockerExecutor>();
    auto handler = std::make_shared<JobHandler>(std::move(executor));

    Logger::log(LogLevel::INFO, "", "Worker Service initializing...");

    svr.Post("/execute", [handler](const httplib::Request& req, httplib::Response& res) {
        std::string jobId = "unknown";
        try {
            auto j = json::parse(req.body);
            
            JobConfig config;
            config.jobId = j.at("jobId").get<std::string>();
            config.code = j.at("code").get<std::string>();
            config.language = j.at("language").get<std::string>();
            config.timeLimitMs = j.value("timeLimit", 2000);
            config.memoryLimitMb = j.value("memoryLimit", 128);
            
            if (j.contains("testCases") && j["testCases"].is_array()) {
                for (const auto& tcJson : j["testCases"]) {
                    TestCase tc;
                    tc.input = tcJson.value("input", "");
                    tc.expectedOutput = tcJson.value("expectedOutput", "");
                    config.testCases.push_back(tc);
                }
            }
            
            jobId = config.jobId;

            // Handle the job
            ExecutionResult result = handler->handle(config);

            // Construct response
            json resJson;
            resJson["status"] = result.status;
            resJson["jobId"] = result.jobId;
            resJson["testCases"] = json::array();

            for (const auto& tcRes : result.testCases) {
                json tcJson;
                tcJson["output"] = tcRes.output;
                tcJson["exitCode"] = tcRes.exitCode;
                tcJson["status"] = tcRes.status;
                resJson["testCases"].push_back(tcJson);
            }

            res.set_content(resJson.dump(), "application/json");

        } catch (const json::exception& e) {
            Logger::log(LogLevel::ERROR, jobId, "JSON Parsing Error: " + std::string(e.what()));
            json err;
            err["status"] = "error";
            err["message"] = "Invalid JSON payload";
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        } catch (const std::exception& e) {
            Logger::log(LogLevel::ERROR, jobId, "Unexpected Error: " + std::string(e.what()));
            json err;
            err["status"] = "error";
            err["message"] = e.what();
            res.status = 500;
            res.set_content(err.dump(), "application/json");
        }
    });

    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        json health;
        health["status"] = "UP";
        health["version"] = "1.1.0";
        health["capabilities"] = {"python", "cpp", "java"};
        res.set_content(health.dump(), "application/json");
    });

    int port = 4000;
    Logger::log(LogLevel::INFO, "", "Worker Service starting on port " + std::to_string(port));
    
    if (!svr.listen("0.0.0.0", port)) {
        Logger::log(LogLevel::ERROR, "", "Failed to start server on port " + std::to_string(port));
        return 1;
    }

    return 0;
}
