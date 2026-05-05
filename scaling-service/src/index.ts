import dotenv from 'dotenv';
import { lagMonitorService } from './services/lag-monitor.service';

dotenv.config();

const CHECK_INTERVAL = 5000; // 5 seconds
const GROUP_ID = 'scheduler-group';
const TOPIC = 'job_submissions';

const start = async () => {
  console.log('Scaling Service: Starting Lag Monitor...');

  setInterval(async () => {
    try {
      const lag = await lagMonitorService.getLag(GROUP_ID, TOPIC);
      console.log(`Current Kafka Lag [${GROUP_ID} -> ${TOPIC}]: ${lag}`);
      
      if (lag > 10) {
        console.warn(`HIGH LAG DETECTED (${lag}). Scaling up workers recommended.`);
        // In a real K8s environment, we would call the K8s API here to scale deployments
      } else if (lag === 0) {
        console.log('No lag. Scaling down workers to save resources.');
      }
    } catch (error) {
      console.error('Error monitoring lag:', error);
    }
  }, CHECK_INTERVAL);
};

start().catch(console.error);
