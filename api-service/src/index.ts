import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import morgan from 'morgan';
import submissionRoutes from './routes/submission.routes';
import { logger } from './utils/logger';
import { metricsMiddleware, getMetrics } from './utils/metrics';
import { kafkaService } from './services/kafka.service';
import { resultService } from './services/result.service';
import { socketService } from './services/socket.service';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream: { write: (message) => logger.http(message.trim()) } }
  )
);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', submissionRoutes);
app.get('/metrics', getMetrics);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});



const httpServer = createServer(app);

// Start server
const startServer = async () => {
  // Init Socket Service
  socketService.init(httpServer);

  // Connect to Kafka Producer
  await kafkaService.connect();

  // Connect to Kafka Consumer for results
  await kafkaService.connectConsumer(async (topic, message) => {
    if (topic === 'job_results') {
      resultService.setResult(message);
      // Emit to WebSockets
      if (message.jobId) {
        socketService.emitResult(message.jobId, message);
      }
    }
  });

  httpServer.listen(PORT, () => {
    logger.info(`API Service (with WebSockets) is running on port ${PORT}`);
  });
};

startServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
