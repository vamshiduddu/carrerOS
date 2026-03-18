import type { FastifyInstance } from 'fastify';
import { billingPlanRoutes } from './plans';

export async function billingRoutes(app: FastifyInstance) {
	await billingPlanRoutes(app);
}

