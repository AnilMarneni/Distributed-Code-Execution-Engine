#pragma once

#include <iostream>
#include <string>
#include <chrono>
#include <iomanip>
#include <sstream>

enum class LogLevel {
    INFO,
    WARN,
    ERROR,
    DEBUG
};

class Logger {
public:
    static void log(LogLevel level, const std::string& jobId, const std::string& message) {
        auto now = std::chrono::system_clock::now();
        auto in_time_t = std::chrono::system_clock::to_time_t(now);
        
        std::stringstream ss;
        ss << "[" << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %H:%M:%S") << "] ";
        ss << "[" << levelToString(level) << "] ";
        ss << "[Job: " << (jobId.empty() ? "SYSTEM" : jobId) << "] ";
        ss << message;
        
        std::cout << ss.str() << std::endl;
    }

private:
    static std::string levelToString(LogLevel level) {
        switch (level) {
            case LogLevel::INFO: return "INFO";
            case LogLevel::WARN: return "WARN";
            case LogLevel::ERROR: return "ERROR";
            case LogLevel::DEBUG: return "DEBUG";
            default: return "UNKNOWN";
        }
    }
};
