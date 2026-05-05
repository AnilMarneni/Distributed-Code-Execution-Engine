#pragma once

#include <string>
#include <atomic>
#include <sstream>
#include <chrono>

class WorkerMetrics {
public:
    static WorkerMetrics& getInstance() {
        static WorkerMetrics instance;
        return instance;
    }

    void incrementJobsProcessed() {
        jobsProcessed++;
    }

    void incrementJobsFailed() {
        jobsFailed++;
    }

    void recordExecutionTime(long long ms) {
        totalExecutionTimeMs += ms;
    }

    std::string getPrometheusFormat() {
        std::stringstream ss;
        ss << "# HELP worker_jobs_processed_total Total number of jobs processed by this worker\n";
        ss << "# TYPE worker_jobs_processed_total counter\n";
        ss << "worker_jobs_processed_total " << jobsProcessed.load() << "\n\n";

        ss << "# HELP worker_jobs_failed_total Total number of failed jobs\n";
        ss << "# TYPE worker_jobs_failed_total counter\n";
        ss << "worker_jobs_failed_total " << jobsFailed.load() << "\n\n";

        ss << "# HELP worker_execution_time_ms_total Total time spent in execution in ms\n";
        ss << "# TYPE worker_execution_time_ms_total counter\n";
        ss << "worker_execution_time_ms_total " << totalExecutionTimeMs.load() << "\n";

        return ss.str();
    }

private:
    WorkerMetrics() : jobsProcessed(0), jobsFailed(0), totalExecutionTimeMs(0) {}
    
    std::atomic<long long> jobsProcessed;
    std::atomic<long long> jobsFailed;
    std::atomic<long long> totalExecutionTimeMs;
};
