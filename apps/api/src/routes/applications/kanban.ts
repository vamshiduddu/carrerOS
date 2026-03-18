import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { applicationStats } from '../../services/application.service';

export async function applicationKanbanRoutes(app: FastifyInstance) {
	app.patch('/kanban', { preHandler: requireAuth }, async () => {
		return { ok: true };
	});

	app.get('/stats', { preHandler: requireAuth }, async (request) => {
		return applicationStats(request.user!.id);
	});
}

