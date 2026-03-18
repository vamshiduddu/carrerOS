import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

export async function autoApplyRoutes(app: FastifyInstance) {
  // GET /jobs/auto-apply - get auto-apply status
  app.get('/auto-apply', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    const preference = await prisma.userJobPreference.findUnique({ where: { userId } });

    return reply.send({
      enabled: false,
      dailyLimit: 5,
      todayCount: 0,
      preference: preference ?? null
    });
  });

  // POST /jobs/auto-apply/enable - enable auto-apply
  app.post('/auto-apply/enable', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    const preference = await prisma.userJobPreference.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });

    return reply.send({ enabled: true, preference });
  });

  // POST /jobs/auto-apply/disable - disable auto-apply
  app.post('/auto-apply/disable', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    const preference = await prisma.userJobPreference.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });

    return reply.send({ enabled: false, preference });
  });
}
