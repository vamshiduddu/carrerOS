import type { FastifyInstance } from 'fastify';
import { jobSearchRoutes } from './search';

export async function jobRoutes(app: FastifyInstance) {
	await app.register(jobSearchRoutes);
}

