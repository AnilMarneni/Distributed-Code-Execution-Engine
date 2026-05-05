-- Database Schema for Distributed Code Execution Engine

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    job_id UUID PRIMARY KEY,
    language VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Test Case Results Table
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
    test_case_index INT NOT NULL,
    input TEXT,
    expected_output TEXT,
    actual_output TEXT,
    status VARCHAR(20) NOT NULL,
    execution_time_ms INT DEFAULT 0,
    memory_used_kb INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_test_results_job_id ON test_results(job_id);
