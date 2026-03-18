import { logger } from '../../config/logger';
import { seedJobs } from '../../services/job-scraper.service';

export async function processJobScraperJob(_job: { data: Record<string, unknown> }) {
  logger.info('[JobScraperWorker] Running job scraper / seed');
  await seedJobs();
  logger.info('[JobScraperWorker] Job scraper complete');
}

export async function startJobScraperWorker(redisUrl: string) {
  try {
    const { Worker } = await import('bullmq');
    new Worker('job-scraper', processJobScraperJob, { connection: { url: redisUrl } });
    logger.info('[JobScraperWorker] Started');
  } catch (err) {
    logger.warn('[JobScraperWorker] Could not start', err);
  }
}
