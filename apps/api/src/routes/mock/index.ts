import type { FastifyInstance } from 'fastify';
import { mockQuestionRoutes } from './questions';
import { mockSessionRoutes } from './sessions';

export async function mockRoutes(app: FastifyInstance) {
	await mockSessionRoutes(app);
	await mockQuestionRoutes(app);
}

