import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './config/env';
import { registerRoutes } from './routes';

export async function buildApp() {
	const app = Fastify({ logger: true });

	const isDev = env.NODE_ENV !== 'production';
	await app.register(cors, {
		origin: isDev ? true : (env.CORS_ORIGIN || true),
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
	});

	app.get('/health', async () => ({ ok: true }));

	await registerRoutes(app);

	return app;
}

