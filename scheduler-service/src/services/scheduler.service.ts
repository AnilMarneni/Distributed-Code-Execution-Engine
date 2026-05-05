import { JobPayload, JobResult } from '@engine/common';
import axios from 'axios';
import { kafkaService } from './kafka.service';

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
      const response = await axios.post(`${worker.url}/execute`, job);
      const workerResult = response.data;

      console.log(`Received result from worker ${worker.id} for job ${job.jobId}`);

      // Transform to JobResult
      const jobResult: JobResult = {
        jobId: job.jobId,
        status: workerResult.status === 'success' ? 'SUCCESS' : 'FAILED',
        testCaseResults: [
          {
            input: job.testCases[0].input,
            output: workerResult.output,
            expectedOutput: job.testCases[0].expectedOutput,
            status: workerResult.status === 'success' ? 'AC' : 'RTE',
            executionTime: 0, // In Step 1.4 we don't have metrics yet
            memoryUsed: 0
          }
        ]
      };

      await kafkaService.sendResult(jobResult);
    } catch (error) {
      console.error(`Error in dispatchToWorker for job ${job.jobId}:`, error);
      // Send failure result
      const failResult: JobResult = {
        jobId: job.jobId,
        status: 'ERROR',
        testCaseResults: []
      };
      await kafkaService.sendResult(failResult);
    }
  }
}

export const schedulerService = new SchedulerService();
