// Load .env.local from monorepo root if env vars are not already set
import fs from 'node:fs';
import path from 'node:path';
const envFile = path.join(__dirname, '../../../.env.local');
if (fs.existsSync(envFile)) {
	fs.readFileSync(envFile, 'utf8').split('\n').forEach((line) => {
		const [key, ...rest] = line.trim().split('=');
		if (key && !key.startsWith('#') && !(key in process.env)) {
			process.env[key] = rest.join('=').trim();
		}
	});
}

import { buildApp } from './app';
import { env } from './config/env';
import { setupSockets } from './sockets';
import { startJobScraperScheduler } from './queues/schedulers/job-scraper.scheduler';
import { startReminderScheduler } from './queues/schedulers/reminder.scheduler';
import { startMatchScheduler } from './queues/schedulers/match.scheduler';

const start = async () => {
	const app = await buildApp();
	await app.listen({ port: env.PORT, host: '0.0.0.0' });

	setupSockets(app.server, process.env.CORS_ORIGIN || 'http://localhost:3000');

	// Start background schedulers (non-blocking)
	startJobScraperScheduler();
	startReminderScheduler();
	startMatchScheduler();
};
start();
