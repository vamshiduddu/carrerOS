import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware/auth.middleware';
import { registerNotificationHandlers } from './handlers/notification.handler';
import { registerInterviewHandlers } from './handlers/interview.handler';

let _io: Server | null = null;

export function getIo(): Server | null {
  return _io;
}

export function setupSockets(httpServer: any, corsOrigin: string) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true }
  });

  _io = io;

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId: string = socket.data.userId;
    // Each user joins a private room by their userId for targeted pushes
    socket.join(userId);
    console.log(`Socket connected: ${socket.id} user: ${userId}`);

    registerNotificationHandlers(socket);
    registerInterviewHandlers(socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
