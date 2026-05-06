import { JobPayload, JobResult } from '@engine/common';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { kafkaService } from './kafka.service';
import { jobsDispatchedCounter } from '../utils/metrics';
import { logger } from '../utils/logger';
import CircuitBreaker from 'opossum';

// Configure axios retry with exponential backoff
axiosRetry(axios, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => error.response?.status === 500 || axiosRetry.isNetworkError(error)
});

interface WorkerInfo {
  id: string;
  url: string;
  status: 'IDLE' | 'BUSY' | 'DOWN';
}

class SchedulerService {
  private workers: WorkerInfo[] = [
    // For Phase 1, we will hardcode a local worker that we'll build in Step 1.4
    { id: 'worker-1', url: 'http://localhost:4000', status: 'IDLE' }
  ];
  private currentWorkerIndex: number = 0;
  private breaker: CircuitBreaker;

  constructor() {
    this.breaker = new CircuitBreaker(this.dispatchToWorker.bind(this), {
      timeout: 10000, // 10 seconds
      errorThresholdPercentage: 50,
      resetTimeout: 30000 // 30 seconds
    });

    this.breaker.on('open', () => logger.warn('CIRCUIT BREAKER OPEN: Worker dispatching suspended'));
    this.breaker.on('close', () => logger.info('CIRCUIT BREAKER CLOSED: Worker dispatching resumed'));
    
    this.startHealthCheck();
  }

  private startHealthCheck() {
    setInterval(async () => {
      for (const worker of this.workers) {
        try {
          await axios.get(`${worker.url}/health`, { timeout: 2000 });
          if (worker.status !== 'IDLE') logger.info(`Worker ${worker.id} is back UP`);
          worker.status = 'IDLE';
        } catch (error) {
          if (worker.status !== 'DOWN') logger.warn(`Worker ${worker.id} is DOWN`);
          worker.status = 'DOWN';
        }
      }
    }, 10000); // Every 10 seconds
  }

  private getNextWorker(): WorkerInfo | null {
    const availableWorkers = this.workers.filter(w => w.status !== 'DOWN');
    if (availableWorkers.length === 0) return null;
    
    const worker = availableWorkers[this.currentWorkerIndex % availableWorkers.length];
    this.currentWorkerIndex++;
    return worker;
  }

  async scheduleJob(job: JobPayload) {
    const worker = this.getNextWorker();
    
    if (!worker) {
      logger.error(`No available workers for job: ${job.jobId}`);
      return;
    }

    logger.info(`Scheduling job ${job.jobId} to worker ${worker.id} at ${worker.url}`);
    
    try {
        await this.breaker.fire(worker, job);
    } catch (error) {
        logger.error(`Circuit Breaker / Dispatch error for job ${job.jobId}: ${error}`);
    }
  }

  private async dispatchToWorker(worker: WorkerInfo, job: JobPayload) {
    try {
      jobsDispatchedCounter.labels(worker.id).inc();
      const response = await axios.post(`${worker.url}/execute`, job);
      const workerResult = response.data;

      logger.info(`Received result from worker ${worker.id} for job ${job.jobId}`);

      // Forward to Evaluation Service via Kafka
      await kafkaService.sendRawResult({
        job,
        workerResult
      });
      
    } catch (error) {
      logger.error(`Error in dispatchToWorker for job ${job.jobId}: ${error}`);
      // Send a system error raw result
      await kafkaService.sendRawResult({
        job,
        workerResult: {
          status: 'error',
          output: (error as Error).message,
          exitCode: -1
        }
      });
    }
  }
}

export const schedulerService = new SchedulerService();
