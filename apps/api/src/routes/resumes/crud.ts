import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import {
	createResume,
	deleteResume,
	getResumeById,
	listResumes,
	updateResume
} from '../../services/resume.service';

const createResumeSchema = z.object({
	title: z.string().min(2)
});

const updateResumeSchema = z.object({
	title: z.string().min(2).optional()
});

export async function resumeCrudRoutes(app: FastifyInstance) {
	app.get('/', { preHandler: requireAuth }, async (request) => {
		return listResumes(request.user!.id);
	});

	app.post('/', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const body = createResumeSchema.parse(request.body);
			const created = await createResume(request.user!.id, body);
			return reply.code(201).send(created);
		} catch {
			return reply.code(400).send({ error: 'Invalid resume payload' });
		}
	});

	app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const resume = await getResumeById(request.user!.id, params.id);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}
		return reply.send(resume);
	});

	app.put('/:id', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const params = request.params as { id: string };
			const body = updateResumeSchema.parse(request.body);
			const updated = await updateResume(request.user!.id, params.id, body);
			if (!updated) {
				return reply.code(404).send({ error: 'Resume not found' });
			}
			return reply.send(updated);
		} catch {
			return reply.code(400).send({ error: 'Invalid resume payload' });
		}
	});

	app.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const deleted = await deleteResume(request.user!.id, params.id);
		if (!deleted) {
			return reply.code(404).send({ error: 'Resume not found' });
		}
		return reply.send({ ok: true });
	});
}

