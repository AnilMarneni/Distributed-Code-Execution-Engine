import { Kafka, Consumer } from 'kafkajs';
import dotenv from 'dotenv';
import { JobResult } from '@engine/common';
import { dbService } from './db.service';
import { redisService } from './redis.service';

dotenv.config();

class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'result-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    });
    this.consumer = this.kafka.consumer({ groupId: 'result-group' });
  }

  async connect() {
    await this.consumer.connect();
    console.log('Result Service: Connected to Kafka');
  }

  async listen() {
    await this.consumer.subscribe({ topic: 'job_results', fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const result = JSON.parse(message.value.toString()) as JobResult;
          console.log(`Processing result for job: ${result.jobId}`);
          
          try {
            // 1. Save to Postgres
            await dbService.saveResult(result);
            
            // 2. Cache in Redis
            await redisService.cacheJobStatus(result.jobId, result.status);
            await redisService.cacheJobResult(result);
            
            console.log(`Successfully persisted and cached job: ${result.jobId}`);
          } catch (error) {
            console.error(`Failed to process result for job ${result.jobId}`, error);
          }
        }
      }
    });
  }
}

export const kafkaService = new KafkaService();
