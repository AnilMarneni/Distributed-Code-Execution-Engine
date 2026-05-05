import { createClient } from 'redis';
import dotenv from 'dotenv';
import { JobResult } from '@engine/common';

dotenv.config();

class RedisService {
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async connect() {
    await this.client.connect();
    console.log('Redis Service: Connected');
  }

  async cacheJobStatus(jobId: string, status: string) {
    await this.client.set(`job_status:${jobId}`, status, {
      EX: 3600 // Expire in 1 hour
    });
  }

  async cacheJobResult(result: JobResult) {
    await this.client.set(`job_result:${result.jobId}`, JSON.stringify(result), {
      EX: 3600
    });
  }
}

export const redisService = new RedisService();
