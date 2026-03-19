import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { refreshMatchesForUser } from '../../services/match.service';
import { getIo } from '../../sockets/index';

const prefsSchema = z.object({
  titles:    z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  remote:    z.boolean().default(false),
  jobTypes:  z.array(z.string()).default([]),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  keywords:  z.array(z.string()).default([])
});

export async function jobPreferenceRoutes(app: FastifyInstance) {
  // GET /jobs/preferences
  app.get('/preferences', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;
    const prefs = await prisma.userJobPreference.findUnique({ where: { userId } });
    return reply.send(prefs ?? { userId, titles: [], locations: [], remote: false, jobTypes: [], keywords: [] });
  });

  // PUT /jobs/preferences — save and immediately trigger live job fetch + socket push
  app.put('/preferences', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    const body = prefsSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: 'Invalid preferences', details: body.error.flatten() });

    const data = body.data;

    const prefs = await prisma.userJobPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });

    // Fire-and-forget: fetch live jobs, compute matches, push via socket
    refreshMatchesForUser(userId)
      .then((matches) => {
        const io = getIo();
        if (io) {
          io.to(userId).emit('job:matches', { matches, total: matches.length });
        }
      })
      .catch((err) => console.error('[JobMatch] refresh failed', err));

    return reply.send(prefs);
  });
}
