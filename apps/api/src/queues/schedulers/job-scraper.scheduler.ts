import { seedJobs } from '../../services/job-scraper.service';
import { logger } from '../../config/logger';

export function startJobScraperScheduler() {
  // Run once on startup, then every 6 hours
  seedJobs().catch((err) => logger.error('[JobScraper] Failed', err));
  setInterval(() => {
    seedJobs().catch((err) => logger.error('[JobScraper] Failed', err));
  }, 6 * 60 * 60 * 1000);
  logger.info('[JobScraper] Scheduler started');
}
