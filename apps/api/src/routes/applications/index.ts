import type { FastifyInstance } from 'fastify';
import { applicationCrudRoutes } from './crud';
import { applicationKanbanRoutes } from './kanban';
import { applicationTimelineRoutes } from './timeline';

export async function applicationRoutes(app: FastifyInstance) {
	await applicationCrudRoutes(app);
	await applicationTimelineRoutes(app);
	await applicationKanbanRoutes(app);
}

