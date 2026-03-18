import type { FastifyInstance } from 'fastify';
import { profileRoutes } from './profile';
import { settingsRoutes } from './settings';

export async function userRoutes(app: FastifyInstance) {
	await profileRoutes(app);
	await settingsRoutes(app);
}

