import type { FastifyInstance } from 'fastify';
import { autoApplyRoutes } from './auto-apply';
import { jobMatchRoutes } from './matches';
import { jobPreferenceRoutes } from './preferences';
import { jobSearchRoutes } from './search';

export async function jobRoutes(app: FastifyInstance) {
	await app.register(jobSearchRoutes);
	await app.register(autoApplyRoutes);
	await app.register(jobMatchRoutes);
	await app.register(jobPreferenceRoutes);
}
