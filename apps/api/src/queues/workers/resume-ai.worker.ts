import { logger } from '../../config/logger';

export async function processResumeAiJob(job: {
  data: { userId: string; resumeId: string; action: string };
}) {
  logger.info(
    `[ResumeAiWorker] Processing AI action "${job.data.action}" for resume ${job.data.resumeId}`
  );
  // In production: call AI service to enhance/score resume
}

export async function startResumeAiWorker(redisUrl: string) {
  try {
    const { Worker } = await import('bullmq');
    new Worker('resume-ai', processResumeAiJob, { connection: { url: redisUrl } });
    logger.info('[ResumeAiWorker] Started');
  } catch (err) {
    logger.warn('[ResumeAiWorker] Could not start', err);
  }
}
