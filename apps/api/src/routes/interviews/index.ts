import type { FastifyInstance } from 'fastify';
import { interviewSessionRoutes } from './sessions';
import { interviewTurnRoutes } from './turns';

export async function interviewRoutes(app: FastifyInstance) {
	await interviewSessionRoutes(app);
	await interviewTurnRoutes(app);
}

