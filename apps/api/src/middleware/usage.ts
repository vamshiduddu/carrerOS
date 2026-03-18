import type { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../config/logger';

export function trackUsage(feature: string) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user?.id ?? 'anonymous';
    logger.info(`[Usage] Feature "${feature}" accessed by user ${userId}`);
    // In production: write usage record to DB
  };
}
