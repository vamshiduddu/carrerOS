import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { getResumeById, listItems, createItem, updateItem, deleteItem } from '../../services/resume.service';

const createItemSchema = z.object({
	sortOrder: z.number().int().optional()
});

const updateItemSchema = z.object({
	sortOrder: z.number().int().optional()
});

export async function resumeItemRoutes(app: FastifyInstance) {
	// GET /resumes/:resumeId/sections/:sectionId/items
	app.get(
		'/:resumeId/sections/:sectionId/items',
		{ preHandler: requireAuth },
		async (request, reply) => {
			const { resumeId, sectionId } = request.params as {
				resumeId: string;
				sectionId: string;
			};

			const resume = await getResumeById(request.user!.id, resumeId);
			if (!resume) {
				return reply.code(404).send({ error: 'Resume not found' });
			}

			const items = await listItems(sectionId);
			return reply.send(items);
		}
	);

	// POST /resumes/:resumeId/sections/:sectionId/items
	app.post(
		'/:resumeId/sections/:sectionId/items',
		{ preHandler: requireAuth },
		async (request, reply) => {
			const { resumeId, sectionId } = request.params as {
				resumeId: string;
				sectionId: string;
			};

			const resume = await getResumeById(request.user!.id, resumeId);
			if (!resume) {
				return reply.code(404).send({ error: 'Resume not found' });
			}

			try {
				const body = createItemSchema.parse(request.body);
				const item = await createItem(resumeId, sectionId, body);
				return reply.code(201).send(item);
			} catch {
				return reply.code(400).send({ error: 'Invalid item payload' });
			}
		}
	);

	// PUT /resumes/:resumeId/sections/:sectionId/items/:itemId
	app.put(
		'/:resumeId/sections/:sectionId/items/:itemId',
		{ preHandler: requireAuth },
		async (request, reply) => {
			const { resumeId, itemId } = request.params as {
				resumeId: string;
				sectionId: string;
				itemId: string;
			};

			const resume = await getResumeById(request.user!.id, resumeId);
			if (!resume) {
				return reply.code(404).send({ error: 'Resume not found' });
			}

			try {
				const body = updateItemSchema.parse(request.body);
				const updated = await updateItem(itemId, body);
				return reply.send(updated);
			} catch {
				return reply.code(400).send({ error: 'Invalid item payload' });
			}
		}
	);

	// DELETE /resumes/:resumeId/sections/:sectionId/items/:itemId
	app.delete(
		'/:resumeId/sections/:sectionId/items/:itemId',
		{ preHandler: requireAuth },
		async (request, reply) => {
			const { resumeId, itemId } = request.params as {
				resumeId: string;
				sectionId: string;
				itemId: string;
			};

			const resume = await getResumeById(request.user!.id, resumeId);
			if (!resume) {
				return reply.code(404).send({ error: 'Resume not found' });
			}

			await deleteItem(itemId);
			return reply.send({ ok: true });
		}
	);
}
