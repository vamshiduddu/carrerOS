import { logger } from '../../config/logger';

export async function processPdfJob(job: {
  data: { userId: string; resumeId: string; outputFormat?: string };
}) {
  logger.info(
    `[PdfWorker] Generating PDF for user ${job.data.userId}, resume ${job.data.resumeId}`
  );
  // In production: render HTML to PDF using puppeteer or similar
}

export async function startPdfWorker(redisUrl: string) {
  try {
    const { Worker } = await import('bullmq');
    new Worker('pdf-generation', processPdfJob, { connection: { url: redisUrl } });
    logger.info('[PdfWorker] Started');
  } catch (err) {
    logger.warn('[PdfWorker] Could not start', err);
  }
}
