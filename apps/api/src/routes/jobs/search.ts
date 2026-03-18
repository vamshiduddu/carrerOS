import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { getJob, listJobs, searchJobs } from '../../services/job.service';

const searchSchema = z.object({ query: z.string().min(1) });

export async function jobSearchRoutes(app: FastifyInstance) {
	app.get('/', { preHandler: requireAuth }, async (request) => {
		const query = request.query as { q?: string; limit?: string };
		return listJobs({ q: query.q, limit: query.limit ? Number(query.limit) : undefined });
	});

	app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };
		const job = await getJob(params.id);
		if (!job) {
			return reply.code(404).send({ error: 'Job not found' });
		}
		return reply.send(job);
	});

	app.post('/search', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const body = searchSchema.parse(request.body);
			const results = await searchJobs(body.query);
			return reply.send({ jobs: results, total: results.length });
		} catch {
			return reply.code(400).send({ error: 'Invalid search payload' });
		}
	});
}

