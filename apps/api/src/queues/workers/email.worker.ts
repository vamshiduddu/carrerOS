import { logger } from '../../config/logger';

export async function processEmailJob(job: {
  data: { to: string; subject: string; body: string };
}) {
  logger.info(`[EmailWorker] Sending email to ${job.data.to}: ${job.data.subject}`);
  // In production: call email service (e.g. Resend)
}

export async function startEmailWorker(redisUrl: string) {
  try {
    const { Worker } = await import('bullmq');
    new Worker('email', processEmailJob, { connection: { url: redisUrl } });
    logger.info('[EmailWorker] Started');
  } catch (err) {
    logger.warn('[EmailWorker] Could not start', err);
  }
}
