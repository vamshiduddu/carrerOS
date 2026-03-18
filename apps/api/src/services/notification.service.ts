import { prisma } from '../config/database';

export async function listNotifications(userId: string, unreadOnly = false) {
	const existing = await prisma.notification.count({ where: { userId } });
	if (existing === 0) {
		await prisma.notification.createMany({
			data: [
				{
					userId,
					type: 'feature',
					title: 'Welcome to CareerOS',
					body: 'Start by creating your first resume.'
				},
				{
					userId,
					type: 'job_match',
					title: 'New job matches available',
					body: 'You have 3 new recommended roles.'
				}
			]
		});
	}

	return prisma.notification.findMany({
		where: {
			userId,
			...(unreadOnly ? { isRead: false } : {})
		},
		orderBy: { createdAt: 'desc' }
	});
}

export async function markRead(userId: string, id: string) {
	const existing = await prisma.notification.findFirst({ where: { id, userId } });
	if (!existing) {
		return null;
	}
	return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllRead(userId: string) {
	await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
	return { ok: true };
}

export async function deleteNotification(userId: string, id: string) {
	const existing = await prisma.notification.findFirst({ where: { id, userId } });
	if (!existing) {
		return false;
	}
	await prisma.notification.delete({ where: { id } });
	return true;
}

export async function unreadCount(userId: string) {
	const unread = await prisma.notification.count({ where: { userId, isRead: false } });
	return { unread };
}

