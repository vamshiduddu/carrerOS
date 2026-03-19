import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { getResumeById, listItems, createItem, updateItem, deleteItem } from '../../services/resume.service';

const createItemSchema = z.object({
	sortOrder: z.number().int().optional(),
	content: z.record(z.unknown()).optional()
});

const updateItemSchema = z.object({
	sortOrder: z.number().int().optional(),
	content: z.record(z.unknown()).optional()
});

export async function resumeItemRoutes(app: FastifyInstance) {
	app.get('/:resumeId/sections/:sectionId/items', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId, sectionId } = request.params as { resumeId: string; sectionId: string };
		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) return reply.code(404).send({ error: 'Resume not found' });
		return reply.send(await listItems(sectionId));
	});

	app.post('/:resumeId/sections/:sectionId/items', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId, sectionId } = request.params as { resumeId: string; sectionId: string };
		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) return reply.code(404).send({ error: 'Resume not found' });
		try {
			const body = createItemSchema.parse(request.body);
			const item = await createItem(resumeId, sectionId, body);
			return reply.code(201).send(item);
		} catch {
			return reply.code(400).send({ error: 'Invalid item payload' });
		}
	});

	// Support both PUT and PATCH
	const updateHandler = async (request: any, reply: any) => {
		const { resumeId, itemId } = request.params as { resumeId: string; itemId: string };
		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) return reply.code(404).send({ error: 'Resume not found' });
		try {
			const body = updateItemSchema.parse(request.body);
			return reply.send(await updateItem(itemId, body));
		} catch {
			return reply.code(400).send({ error: 'Invalid item payload' });
		}
	};

	app.put('/:resumeId/sections/:sectionId/items/:itemId', { preHandler: requireAuth }, updateHandler);
	app.patch('/:resumeId/sections/:sectionId/items/:itemId', { preHandler: requireAuth }, updateHandler);

	app.delete('/:resumeId/sections/:sectionId/items/:itemId', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId, itemId } = request.params as { resumeId: string; itemId: string };
		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) return reply.code(404).send({ error: 'Resume not found' });
		await deleteItem(itemId);
		return reply.send({ ok: true });
	});
}
