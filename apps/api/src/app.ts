import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './config/env';
import { registerRoutes } from './routes';

export async function buildApp() {
	const app = Fastify({ logger: true });

	const isDev = env.NODE_ENV !== 'production';
	const allowedOrigins = (env.CORS_ORIGIN || '')
		.split(',')
		.map((o) => o.trim().replace(/\/$/, ''))
		.filter(Boolean);

	await app.register(cors, {
		origin: isDev || allowedOrigins.length === 0
			? true
			: (origin, cb) => {
				const clean = (origin || '').replace(/\/$/, '');
				cb(null, allowedOrigins.includes(clean));
			},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
	});

	app.get('/health', { logLevel: 'silent' }, async () => ({ ok: true }));

	await registerRoutes(app);

	return app;
}

