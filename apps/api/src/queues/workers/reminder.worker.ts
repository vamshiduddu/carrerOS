import { logger } from '../../config/logger';

export async function processReminderJob(job: {
  data: { userId: string; reminderId: string; title: string };
}) {
  logger.info(
    `[ReminderWorker] Processing reminder "${job.data.title}" for user ${job.data.userId}`
  );
  // In production: send push notification or email
}

export async function startReminderWorker(redisUrl: string) {
  try {
    const { Worker } = await import('bullmq');
    new Worker('reminder', processReminderJob, { connection: { url: redisUrl } });
    logger.info('[ReminderWorker] Started');
  } catch (err) {
    logger.warn('[ReminderWorker] Could not start', err);
  }
}
