CREATE TABLE IF NOT EXISTS jobs (
    job_id UUID PRIMARY KEY,
    language VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_results (
    job_id UUID REFERENCES jobs(job_id),
    test_case_index INTEGER NOT NULL,
    input TEXT,
    expected_output TEXT,
    actual_output TEXT,
    status VARCHAR(20),
    execution_time_ms INTEGER,
    memory_used_kb INTEGER,
    PRIMARY KEY (job_id, test_case_index)
);
