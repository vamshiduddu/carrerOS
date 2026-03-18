import { prisma } from '../../config/database';

export function registerInterviewHandlers(socket: any) {
  socket.on('interview:join', (sessionId: string) => {
    socket.join(`interview:${sessionId}`);
    socket.emit('interview:joined', { sessionId });
  });

  socket.on('interview:message', async (data: { sessionId: string; content: string }) => {
    const turn = await prisma.interviewTurn.create({
      data: {
        sessionId: data.sessionId,
        role: 'user',
        content: data.content
      }
    });
    socket.to(`interview:${data.sessionId}`).emit('interview:turn', turn);
  });

  socket.on('interview:leave', (sessionId: string) => {
    socket.leave(`interview:${sessionId}`);
  });
}
