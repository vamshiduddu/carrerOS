import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware/auth.middleware';
import { registerNotificationHandlers } from './handlers/notification.handler';
import { registerInterviewHandlers } from './handlers/interview.handler';

export function setupSockets(httpServer: any, corsOrigin: string) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} user: ${socket.data.userId}`);
    registerNotificationHandlers(socket);
    registerInterviewHandlers(socket);
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
