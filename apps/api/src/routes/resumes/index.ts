import type { FastifyInstance } from 'fastify';
import { resumeCrudRoutes } from './crud';
import { resumeSectionRoutes } from './sections';
import { resumeItemRoutes } from './items';
import { resumeAtsRoutes } from './ats';
import { resumeAiRoutes } from './ai';
import { resumeVersionRoutes } from './versions';
import { resumePdfRoutes } from './pdf';

export async function resumeRoutes(app: FastifyInstance) {
	await app.register(resumeCrudRoutes);
	await app.register(resumeSectionRoutes);
	await app.register(resumeItemRoutes);
	await app.register(resumeAtsRoutes);
	await app.register(resumeAiRoutes);
	await app.register(resumeVersionRoutes);
	await app.register(resumePdfRoutes);
}
