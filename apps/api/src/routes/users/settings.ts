import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { getSettings, updateSettings } from '../../services/user.service';

export async function settingsRoutes(app: FastifyInstance) {
	app.get('/settings', { preHandler: requireAuth }, async (request, reply) => {
		const settings = await getSettings(request.user!.id);
		return reply.send(settings ?? null);
	});

	app.patch('/settings', { preHandler: requireAuth }, async (request, reply) => {
		const settings = await updateSettings(request.user!.id);
		return reply.send(settings);
	});
}

