#pragma once

#include "../models/job_models.hpp"
#include <string>

class IExecutor {
public:
    virtual ~IExecutor() = default;
    virtual CommandResult execute(const JobConfig& config, const std::string& filePath, const std::string& input = "") = 0;
};
