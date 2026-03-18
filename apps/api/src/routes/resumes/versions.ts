import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { getResumeById, createVersion, listVersions, getVersion } from '../../services/resume.service';

export async function resumeVersionRoutes(app: FastifyInstance) {
	// GET /resumes/:resumeId/versions
	app.get('/:resumeId/versions', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId } = request.params as { resumeId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}

		const versions = await listVersions(resumeId);
		return reply.send(versions);
	});

	// POST /resumes/:resumeId/versions
	app.post('/:resumeId/versions', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId } = request.params as { resumeId: string };

		try {
			const version = await createVersion(request.user!.id, resumeId);
			return reply.code(201).send(version);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not create version';
			if (message === 'Resume not found') {
				return reply.code(404).send({ error: message });
			}
			return reply.code(500).send({ error: message });
		}
	});

	// GET /resumes/:resumeId/versions/:versionId
	app.get(
		'/:resumeId/versions/:versionId',
		{ preHandler: requireAuth },
		async (request, reply) => {
			const { resumeId, versionId } = request.params as {
				resumeId: string;
				versionId: string;
			};

			const resume = await getResumeById(request.user!.id, resumeId);
			if (!resume) {
				return reply.code(404).send({ error: 'Resume not found' });
			}

			const version = await getVersion(resumeId, versionId);
			if (!version) {
				return reply.code(404).send({ error: 'Version not found' });
			}

			return reply.send(version);
		}
	);
}
