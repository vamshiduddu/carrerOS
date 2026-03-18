import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import {
	completeMockSession,
	createMockSession,
	deleteMockSession,
	getMockReport,
	getMockSession,
	listMockSessions
} from '../../services/mock.service';

export async function mockSessionRoutes(app: FastifyInstance) {
	app.get('/', { preHandler: requireAuth }, async (request) => {
		return listMockSessions(request.user!.id);
	});

	app.post('/', { preHandler: requireAuth }, async (request, reply) => {
		const session = await createMockSession(request.user!.id);
		return reply.code(201).send(session);
	});

	app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const session = await getMockSession(request.user!.id, params.id);
		if (!session) {
			return reply.code(404).send({ error: 'Mock session not found' });
		}
		return session;
	});

	app.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const deleted = await deleteMockSession(request.user!.id, params.id);
		if (!deleted) {
			return reply.code(404).send({ error: 'Mock session not found' });
		}
		return { ok: true };
	});

	app.post('/:id/start', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const session = await getMockSession(request.user!.id, params.id);
		if (!session) {
			return reply.code(404).send({ error: 'Mock session not found' });
		}
		return { ok: true };
	});

	app.post('/:id/complete', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const session = await completeMockSession(request.user!.id, params.id);
		if (!session) {
			return reply.code(404).send({ error: 'Mock session not found' });
		}
		return session;
	});

	app.get('/:id/report', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const report = await getMockReport(request.user!.id, params.id);
		if (!report) {
			return reply.code(404).send({ error: 'Mock session not found' });
		}
		return report;
	});
}

