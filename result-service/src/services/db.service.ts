import { Pool } from 'pg';
import dotenv from 'dotenv';
import { JobResult, TestCaseResult } from '@engine/common';

dotenv.config();

class DBService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/engine_db'
    });
  }

  async saveResult(result: JobResult) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update Job Status
      const jobQuery = `
        INSERT INTO jobs (job_id, language, status, completed_at)
        VALUES ($1, 'unknown', $2, CURRENT_TIMESTAMP)
        ON CONFLICT (job_id) DO UPDATE 
        SET status = $2, completed_at = CURRENT_TIMESTAMP;
      `;
      await client.query(jobQuery, [result.jobId, result.status]);

      // 2. Insert Test Case Results (Idempotent)
      const tcQuery = `
        INSERT INTO test_results (job_id, test_case_index, input, expected_output, actual_output, status, execution_time_ms, memory_used_kb)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (job_id, test_case_index) DO UPDATE 
        SET actual_output = $5, status = $6, execution_time_ms = $7, memory_used_kb = $8;
      `;

      for (let i = 0; i < result.testCaseResults.length; i++) {
        const tc = result.testCaseResults[i];
        await client.query(tcQuery, [
          result.jobId,
          i,
          tc.input,
          tc.expectedOutput,
          tc.output,
          tc.status,
          tc.executionTime,
          tc.memoryUsed
        ]);
      }

      await client.query('COMMIT');

      // 3. Cache in Redis with 1-hour TTL (Phase 8 Fix)
      // await redis.set(`result:${result.jobId}`, JSON.stringify(result), 'EX', 3600);

      console.log(`DB Service: Saved results for job ${result.jobId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`DB Service: Failed to save results for job ${result.jobId}`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const dbService = new DBService();
