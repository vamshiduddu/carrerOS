import type { FastifyInstance } from 'fastify';
import { aiRoutes } from './ai';
import { authRoutes } from './auth';
import { billingRoutes } from './billing';
import { applicationRoutes } from './applications';
import { interviewRoutes } from './interviews';
import { jobRoutes } from './jobs';
import { mockRoutes } from './mock';
import { notificationRoutes } from './notifications';
import { resumeRoutes } from './resumes';
import { userRoutes } from './users';

export async function registerRoutes(app: FastifyInstance) {
	await app.register(authRoutes, { prefix: '/v1/auth' });
	await app.register(aiRoutes, { prefix: '/v1/ai' });
	await app.register(userRoutes, { prefix: '/v1/users' });
	await app.register(resumeRoutes, { prefix: '/v1/resumes' });
	await app.register(jobRoutes, { prefix: '/v1/jobs' });
	await app.register(applicationRoutes, { prefix: '/v1/applications' });
	await app.register(interviewRoutes, { prefix: '/v1/interviews' });
	await app.register(mockRoutes, { prefix: '/v1/mock' });
	await app.register(billingRoutes, { prefix: '/v1/billing' });
	await app.register(notificationRoutes, { prefix: '/v1/notifications' });
}

