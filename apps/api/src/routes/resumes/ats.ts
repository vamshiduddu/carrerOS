import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { getResumeById, scoreAts } from '../../services/resume.service';

const atsSchema = z.object({
	jobDescription: z.string().min(1)
});

export async function resumeAtsRoutes(app: FastifyInstance) {
	// POST /resumes/:resumeId/ats
	app.post('/:resumeId/ats', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId } = request.params as { resumeId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}

		try {
			const body = atsSchema.parse(request.body);
			const result = await scoreAts(resumeId, body.jobDescription);
			return reply.send(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'ATS scoring failed';
			return reply.code(400).send({ error: message });
		}
	});
}
