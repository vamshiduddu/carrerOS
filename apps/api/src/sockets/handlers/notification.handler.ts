import { prisma } from '../../config/database';

export function registerNotificationHandlers(socket: any) {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);

  socket.on('notifications:read', async (id: string) => {
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    socket.emit('notifications:updated', { id, isRead: true });
  });

  socket.on('notifications:fetch', async () => {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    socket.emit('notifications:list', notifications);
  });
}
