// Graceful BullMQ setup - logs warning if Redis unavailable
let emailQueue: any = null;
let pdfQueue: any = null;
let reminderQueue: any = null;

export function getEmailQueue() {
  return emailQueue;
}

export function getPdfQueue() {
  return pdfQueue;
}

export function getReminderQueue() {
  return reminderQueue;
}

export async function initQueues() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[Queues] REDIS_URL not set - background job queues disabled');
    return;
  }
  try {
    const { Queue } = await import('bullmq');
    const connection = { url: redisUrl };
    emailQueue = new Queue('email', { connection });
    pdfQueue = new Queue('pdf-generation', { connection });
    reminderQueue = new Queue('reminder', { connection });
    console.log('[Queues] BullMQ queues initialized');
  } catch (err) {
    console.warn('[Queues] Failed to initialize - Redis may be unavailable:', err);
  }
}
