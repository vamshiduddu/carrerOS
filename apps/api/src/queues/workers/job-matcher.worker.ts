import { logger } from '../../config/logger';
import { matchJobsForUser } from '../../services/match.service';

export async function processJobMatcherJob(job: { data: { userId: string } }) {
  logger.info(`[JobMatcherWorker] Running job matching for user ${job.data.userId}`);
  await matchJobsForUser(job.data.userId);
  logger.info(`[JobMatcherWorker] Completed matching for user ${job.data.userId}`);
}

export async function startJobMatcherWorker(redisUrl: string) {
  try {
    const { Worker } = await import('bullmq');
    new Worker('job-matcher', processJobMatcherJob, { connection: { url: redisUrl } });
    logger.info('[JobMatcherWorker] Started');
  } catch (err) {
    logger.warn('[JobMatcherWorker] Could not start', err);
  }
}
