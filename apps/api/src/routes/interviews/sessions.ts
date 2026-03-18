import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import {
	createInterviewSession,
	deleteInterviewSession,
	getInterviewSession,
	listInterviewSessions,
	setInterviewStatus
} from '../../services/interview.service';

const createSchema = z.object({
	title: z.string().min(1),
	type: z.string().min(1)
});

export async function interviewSessionRoutes(app: FastifyInstance) {
	app.get('/', { preHandler: requireAuth }, async (request) => {
		return listInterviewSessions(request.user!.id);
	});

	app.post('/', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const body = createSchema.parse(request.body);
			const created = await createInterviewSession(request.user!.id, {
				title: body.title,
				interviewType: body.type
			});
			return reply.code(201).send(created);
		} catch {
			return reply.code(400).send({ error: 'Invalid payload' });
		}
	});

	app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const session = await getInterviewSession(request.user!.id, params.id);
		if (!session) {
			return reply.code(404).send({ error: 'Session not found' });
		}
		return session;
	});

	app.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const deleted = await deleteInterviewSession(request.user!.id, params.id);
		if (!deleted) {
			return reply.code(404).send({ error: 'Session not found' });
		}
		return { ok: true };
	});

	app.post('/:id/start', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const session = await setInterviewStatus(request.user!.id, params.id, 'active');
		if (!session) {
			return reply.code(404).send({ error: 'Session not found' });
		}
		return { socketRoom: session.id, token: 'mock-session-token' };
	});

	app.post('/:id/end', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const session = await setInterviewStatus(request.user!.id, params.id, 'completed');
		if (!session) {
			return reply.code(404).send({ error: 'Session not found' });
		}
		return session;
	});
}

