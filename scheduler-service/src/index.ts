import { kafkaService } from './services/kafka.service';
import { schedulerService } from './services/scheduler.service';
import dotenv from 'dotenv';
import { startMetricsServer } from './utils/metrics';

dotenv.config();

const startScheduler = async () => {
  console.log('Starting Scheduler Service...');
  startMetricsServer(3001);
  
  await kafkaService.connect(async (job) => {
    await schedulerService.scheduleJob(job);
  });
};

startScheduler().catch(err => {
  console.error('Failed to start scheduler:', err);
  process.exit(1);
});
