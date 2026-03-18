import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import {
	deleteNotification,
	listNotifications,
	markAllRead,
	markRead,
	unreadCount
} from '../../services/notification.service';

export async function notificationRoutes(app: FastifyInstance) {
	app.get('/', { preHandler: requireAuth }, async (request) => {
		const query = request.query as { unreadOnly?: string };
		return listNotifications(request.user!.id, query.unreadOnly === 'true');
	});

	app.patch('/:id/read', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const updated = await markRead(request.user!.id, params.id);
		if (!updated) {
			return reply.code(404).send({ error: 'Notification not found' });
		}
		return updated;
	});

	app.patch('/read-all', { preHandler: requireAuth }, async (request) => {
		return markAllRead(request.user!.id);
	});

	app.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const deleted = await deleteNotification(request.user!.id, params.id);
		if (!deleted) {
			return reply.code(404).send({ error: 'Notification not found' });
		}
		return { ok: true };
	});

	app.get('/count', { preHandler: requireAuth }, async (request) => {
		return unreadCount(request.user!.id);
	});
}

