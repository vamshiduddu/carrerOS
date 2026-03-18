import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { addTimelineEvent, listTimeline } from '../../services/application.service';

const noteSchema = z.object({ content: z.string().min(1) });

export async function applicationTimelineRoutes(app: FastifyInstance) {
	app.get('/:id/timeline', { preHandler: requireAuth }, async (request) => {
		const params = request.params as { id: string };
		return listTimeline(request.user!.id, params.id);
	});

	app.post('/:id/notes', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const params = request.params as { id: string };
			const body = noteSchema.parse(request.body);
			const event = await addTimelineEvent(request.user!.id, params.id, 'note_added', body.content);
			return reply.code(201).send(event);
		} catch {
			return reply.code(400).send({ error: 'Invalid payload' });
		}
	});
}

