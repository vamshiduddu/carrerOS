import { logger } from '../../config/logger';

export async function processAutoApplyJob(job: {
  data: { userId: string; jobId: string };
}) {
  logger.info(
    `[AutoApplyWorker] Auto-applying to job ${job.data.jobId} for user ${job.data.userId}`
  );
  // In production: submit application to external job board ATS
}

export async function startAutoApplyWorker(redisUrl: string) {
  try {
    const { Worker } = await import('bullmq');
    new Worker('auto-apply', processAutoApplyJob, { connection: { url: redisUrl } });
    logger.info('[AutoApplyWorker] Started');
  } catch (err) {
    logger.warn('[AutoApplyWorker] Could not start', err);
  }
}
