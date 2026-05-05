import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';

class SocketService {
  private io: SocketServer | null = null;

  init(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*', // In production, restrict this
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);
      
      socket.on('join_job', (jobId: string) => {
        socket.join(jobId);
        logger.info(`Socket ${socket.id} joined room: ${jobId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  emitResult(jobId: string, result: any) {
    if (this.io) {
      this.io.to(jobId).emit('job_result', result);
      logger.debug(`Emitted result for job ${jobId} to room`);
    }
  }
}

export const socketService = new SocketService();
