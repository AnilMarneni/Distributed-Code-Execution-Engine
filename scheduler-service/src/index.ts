import { kafkaService } from './services/kafka.service';
import { schedulerService } from './services/scheduler.service';
import dotenv from 'dotenv';

dotenv.config();

const startScheduler = async () => {
  console.log('Starting Scheduler Service...');
  
  await kafkaService.connect(async (job) => {
    await schedulerService.scheduleJob(job);
  });
};

startScheduler().catch(err => {
  console.error('Failed to start scheduler:', err);
  process.exit(1);
});
