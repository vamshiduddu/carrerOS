import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import {
	createResume,
	deleteResume,
	getResumeById,
	listResumes,
	listSections,
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

	// GET /:id — returns resume WITH sections so the editor can load everything
	app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const { id } = request.params as { id: string };
		const resume = await getResumeById(request.user!.id, id);
		if (!resume) return reply.code(404).send({ error: 'Resume not found' });
		const sections = await listSections(id);
		// Map to the shape the frontend expects: { id, type, title, content, order }
		const mappedSections = sections.map((s) => ({
			id: s.id,
			type: s.type,
			title: s.title,
			content: (s as any).content ?? '',
			order: s.sortOrder
		}));
		return reply.send({ ...resume, sections: mappedSections });
	});

	// Support both PUT and PATCH for title updates
	const updateHandler = async (request: any, reply: any) => {
		try {
			const { id } = request.params as { id: string };
			const body = updateResumeSchema.parse(request.body);
			const updated = await updateResume(request.user!.id, id, body);
			if (!updated) return reply.code(404).send({ error: 'Resume not found' });
			return reply.send(updated);
		} catch {
			return reply.code(400).send({ error: 'Invalid resume payload' });
		}
	};

	app.put('/:id', { preHandler: requireAuth }, updateHandler);
	app.patch('/:id', { preHandler: requireAuth }, updateHandler);

	app.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const { id } = request.params as { id: string };
		const deleted = await deleteResume(request.user!.id, id);
		if (!deleted) return reply.code(404).send({ error: 'Resume not found' });
		return reply.send({ ok: true });
	});
}
