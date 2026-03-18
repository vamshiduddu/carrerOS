import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

export async function jobPreferenceRoutes(app: FastifyInstance) {
  // GET /jobs/preferences - get user job preferences
  app.get('/preferences', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    const preference = await prisma.userJobPreference.findUnique({ where: { userId } });

    return reply.send(preference ?? { userId, message: 'No preferences set yet' });
  });

  // PUT /jobs/preferences - update preferences
  app.put('/preferences', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    // UserJobPreference model only has id, userId, createdAt, updatedAt
    // Upsert to ensure the record exists
    const preference = await prisma.userJobPreference.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });

    return reply.send(preference);
  });
}
