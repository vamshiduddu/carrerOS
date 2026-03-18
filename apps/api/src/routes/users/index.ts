import type { FastifyInstance } from 'fastify';
import { avatarRoutes } from './avatar';
import { profileRoutes } from './profile';
import { settingsRoutes } from './settings';

export async function userRoutes(app: FastifyInstance) {
	await profileRoutes(app);
	await settingsRoutes(app);
	await avatarRoutes(app);
}

