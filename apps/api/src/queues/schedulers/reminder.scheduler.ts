import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

export function startReminderScheduler() {
  setInterval(async () => {
    const due = await prisma.reminder.findMany({
      where: { remindAt: { lte: new Date() }, isSent: false }
    });
    for (const reminder of due) {
      logger.info(`[Reminder] Due reminder: ${reminder.title} for user ${reminder.userId}`);
      await prisma.reminder.update({ where: { id: reminder.id }, data: { isSent: true } });
    }
  }, 60 * 1000); // check every minute
  logger.info('[Reminder] Scheduler started');
}
