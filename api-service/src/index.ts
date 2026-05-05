import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import submissionRoutes from './routes/submission.routes';
import { kafkaService } from './services/kafka.service';
import { resultService } from './services/result.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', submissionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Start server
const startServer = async () => {
  // Connect to Kafka Producer
  await kafkaService.connect();

  // Connect to Kafka Consumer for results
  await kafkaService.connectConsumer(async (topic, message) => {
    if (topic === 'job_results') {
      resultService.setResult(message);
    }
  });

  app.listen(PORT, () => {
    console.log(`API Service is running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
