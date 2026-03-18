import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { getResumeById, listSections, createSection, updateSection, deleteSection } from '../../services/resume.service';

const createSectionSchema = z.object({
	type: z.string().min(1),
	title: z.string().min(1),
	sortOrder: z.number().int().optional()
});

const updateSectionSchema = z.object({
	title: z.string().min(1).optional(),
	sortOrder: z.number().int().optional()
});

export async function resumeSectionRoutes(app: FastifyInstance) {
	// GET /resumes/:resumeId/sections
	app.get('/:resumeId/sections', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId } = request.params as { resumeId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}

		const sections = await listSections(resumeId);
		return reply.send(sections);
	});

	// POST /resumes/:resumeId/sections
	app.post('/:resumeId/sections', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId } = request.params as { resumeId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}

		try {
			const body = createSectionSchema.parse(request.body);
			const section = await createSection(resumeId, body);
			return reply.code(201).send(section);
		} catch {
			return reply.code(400).send({ error: 'Invalid section payload' });
		}
	});

	// PUT /resumes/:resumeId/sections/:sectionId
	app.put('/:resumeId/sections/:sectionId', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId, sectionId } = request.params as { resumeId: string; sectionId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}

		try {
			const body = updateSectionSchema.parse(request.body);
			const updated = await updateSection(sectionId, body);
			return reply.send(updated);
		} catch {
			return reply.code(400).send({ error: 'Invalid section payload' });
		}
	});

	// DELETE /resumes/:resumeId/sections/:sectionId
	app.delete('/:resumeId/sections/:sectionId', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId, sectionId } = request.params as { resumeId: string; sectionId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}

		await deleteSection(sectionId);
		return reply.send({ ok: true });
	});
}
