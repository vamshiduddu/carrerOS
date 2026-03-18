import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export function checkSubscription(feature: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.id;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    logger.info(`[Subscription] Checking feature "${feature}" for user ${userId}`);

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (subscription && subscription.status !== 'active') {
      logger.warn(`[Subscription] Inactive subscription for user ${userId}`);
    }

    // For now, always pass through (free plan or active subscription)
  };
}
