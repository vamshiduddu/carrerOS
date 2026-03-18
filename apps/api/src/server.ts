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
