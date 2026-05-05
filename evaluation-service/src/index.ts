import dotenv from 'dotenv';
import { kafkaService } from './services/kafka.service';
import { EvaluationService } from './services/evaluation.service';
import { EvaluationPayload } from '@engine/common';

const start = async () => {
  await kafkaService.connect();

  console.log('Evaluation Service: Listening for raw_results...');

  await kafkaService.subscribe('raw_results', async (payload: EvaluationPayload) => {
    const { job, workerResult } = payload;
    
    console.log(`Evaluating job: ${job.jobId}`);
    
    const finalResult = EvaluationService.evaluate(
      job, 
      workerResult
    );

    await kafkaService.sendResult(finalResult);
    console.log(`Published final result for job: ${job.jobId}`);
  });
};

start().catch(console.error);
