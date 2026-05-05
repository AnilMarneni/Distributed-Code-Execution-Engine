import { JobPayload, JobResult } from '@engine/common';
import axios from 'axios';
import { kafkaService } from './kafka.service';
import { jobsDispatchedCounter } from '../utils/metrics';

interface WorkerInfo {
  id: string;
  url: string;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
}

class SchedulerService {
  private workers: WorkerInfo[] = [
    // For Phase 1, we will hardcode a local worker that we'll build in Step 1.4
    { id: 'worker-1', url: 'http://localhost:4000', status: 'IDLE' }
  ];
  private currentWorkerIndex: number = 0;

  async scheduleJob(job: JobPayload) {
    const worker = this.getNextWorker();
    
    if (!worker) {
      console.error(`No available workers for job: ${job.jobId}`);
      // In a real system, we might requeue or alert
      return;
    }

    console.log(`Scheduling job ${job.jobId} to worker ${worker.id} at ${worker.url}`);
    
    // In Step 1.4, we will implement the actual call to the worker.
    // For now, we'll just log it.
    try {
        // Mocking the dispatch
        await this.dispatchToWorker(worker, job);
    } catch (error) {
        console.error(`Failed to dispatch job ${job.jobId} to worker ${worker.id}:`, error);
    }
  }

  private getNextWorker(): WorkerInfo | null {
    if (this.workers.length === 0) return null;
    
    const worker = this.workers[this.currentWorkerIndex];
    this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  private async dispatchToWorker(worker: WorkerInfo, job: JobPayload) {
    try {
      jobsDispatchedCounter.labels(worker.id).inc();
      const response = await axios.post(`${worker.url}/execute`, job);
      const workerResult = response.data;

      console.log(`Received result from worker ${worker.id} for job ${job.jobId}`);

      // Forward to Evaluation Service via Kafka
      await kafkaService.sendRawResult({
        job,
        workerResult
      });
      
    } catch (error) {
      console.error(`Error in dispatchToWorker for job ${job.jobId}:`, error);
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
