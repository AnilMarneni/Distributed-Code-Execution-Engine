import dotenv from 'dotenv';
import { kafkaService } from './services/kafka.service';
import { redisService } from './services/redis.service';

dotenv.config();

const start = async () => {
  // Connect to Redis
  await redisService.connect();

  // Connect to Kafka and start listening
  await kafkaService.connect();
  await kafkaService.listen();

  console.log('Result Service: Listening for job_results...');
};

start().catch(err => {
  console.error('Failed to start Result Service:', err);
  process.exit(1);
});
