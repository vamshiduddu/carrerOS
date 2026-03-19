import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { refreshMatchesForUser } from '../../services/match.service';

export async function jobMatchRoutes(app: FastifyInstance) {
  // GET /jobs/matches — returns cached matches; auto-fetches defaults on first visit
  app.get('/matches', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;
    const { prisma } = await import('../../config/database');

    const existing = await prisma.jobMatch.count({ where: { userId } });

    // First visit — run default fetch in the background, return empty immediately
    // so the client gets a fast response and the socket will push results shortly
    if (existing === 0) {
      refreshMatchesForUser(userId)
        .then((matches) => {
          const { getIo } = require('../../sockets/index');
          const io = getIo();
          if (io) io.to(userId).emit('job:matches', { matches, total: matches.length });
        })
        .catch((err: unknown) => console.error('[JobMatch] default fetch failed', err));

      return reply.send({ matches: [], total: 0, loading: true });
    }

    const matches = await prisma.jobMatch.findMany({
      where: { userId },
      orderBy: { matchScore: 'desc' },
      take: 50
    });

    const jobIds = matches.map((m) => m.jobId);
    const jobs = await prisma.jobListing.findMany({ where: { id: { in: jobIds } } });
    const jobMap = new Map(jobs.map((j) => [j.id, j]));

    const result = matches
      .map((m) => ({ ...m, matchScore: Number(m.matchScore), job: jobMap.get(m.jobId) ?? null }))
      .filter((m) => m.job !== null);

    return reply.send({ matches: result, total: result.length });
  });

  // POST /jobs/matches/refresh — force re-fetch from live feeds + re-score
  app.post('/matches/refresh', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;
    const matches = await refreshMatchesForUser(userId);
    return reply.send({ matches, total: matches.length });
  });
}
