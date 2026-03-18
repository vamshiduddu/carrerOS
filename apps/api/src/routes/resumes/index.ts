import type { FastifyInstance } from 'fastify';
import { resumeCrudRoutes } from './crud';

export async function resumeRoutes(app: FastifyInstance) {
	await app.register(resumeCrudRoutes);
}

