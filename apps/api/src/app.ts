import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './config/env';
import { registerRoutes } from './routes';

export async function buildApp() {
	const app = Fastify({ logger: true });

	await app.register(cors, {
		origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN
	});

	app.get('/health', async () => ({ ok: true }));

	await registerRoutes(app);

	return app;
}

