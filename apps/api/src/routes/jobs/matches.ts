import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

export async function jobMatchRoutes(app: FastifyInstance) {
  // GET /jobs/matches - get job matches for current user
  app.get('/matches', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    const matches = await prisma.jobMatch.findMany({
      where: { userId },
      orderBy: { matchScore: 'desc' }
    });

    // Fetch job data for each match
    const jobIds = matches.map((m) => m.jobId);
    const jobs = await prisma.jobListing.findMany({
      where: { id: { in: jobIds } }
    });

    const jobMap = new Map(jobs.map((j) => [j.id, j]));

    const result = matches.map((match) => ({
      ...match,
      job: jobMap.get(match.jobId) ?? null
    }));

    return reply.send({ matches: result, total: result.length });
  });
}
