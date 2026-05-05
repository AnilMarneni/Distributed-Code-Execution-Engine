import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useSocket = (jobId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (jobId) {
        socket.emit('join_job', jobId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('job_result', (data) => {
      setResult(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId]);

  return { isConnected, result };
};
