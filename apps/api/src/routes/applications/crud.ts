import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import {
	createApplication,
	getApplication,
	listApplications,
	removeApplication,
	updateApplication,
	updateStatus
} from '../../services/application.service';

const createSchema = z.object({
	company: z.string().min(1),
	role: z.string().min(1),
	status: z.string().optional()
});

const updateSchema = z.object({
	company: z.string().min(1).optional(),
	role: z.string().min(1).optional(),
	status: z.string().optional()
});

const statusSchema = z.object({ status: z.string().min(1) });

export async function applicationCrudRoutes(app: FastifyInstance) {
	app.get('/', { preHandler: requireAuth }, async (request) => {
		const query = request.query as { status?: string };
		return listApplications(request.user!.id, query.status);
	});

	app.post('/', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const body = createSchema.parse(request.body);
			const created = await createApplication(request.user!.id, body);
			return reply.code(201).send(created);
		} catch {
			return reply.code(400).send({ error: 'Invalid payload' });
		}
	});

	app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const appItem = await getApplication(request.user!.id, params.id);
		if (!appItem) {
			return reply.code(404).send({ error: 'Application not found' });
		}
		return appItem;
	});

	app.put('/:id', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const params = request.params as { id: string };
			const body = updateSchema.parse(request.body);
			const updated = await updateApplication(request.user!.id, params.id, body);
			if (!updated) {
				return reply.code(404).send({ error: 'Application not found' });
			}
			return updated;
		} catch {
			return reply.code(400).send({ error: 'Invalid payload' });
		}
	});

	app.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const deleted = await removeApplication(request.user!.id, params.id);
		if (!deleted) {
			return reply.code(404).send({ error: 'Application not found' });
		}
		return { ok: true };
	});

	app.patch('/:id/status', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const params = request.params as { id: string };
			const body = statusSchema.parse(request.body);
			const updated = await updateStatus(request.user!.id, params.id, body.status);
			if (!updated) {
				return reply.code(404).send({ error: 'Application not found' });
			}
			return updated;
		} catch {
			return reply.code(400).send({ error: 'Invalid payload' });
		}
	});
}

