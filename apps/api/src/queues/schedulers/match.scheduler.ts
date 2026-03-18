import { matchJobsForUser } from '../../services/match.service';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

export function startMatchScheduler() {
  setInterval(async () => {
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await matchJobsForUser(user.id).catch((err) =>
        logger.error('[Match] Failed for user', err)
      );
    }
  }, 60 * 60 * 1000); // run every hour
  logger.info('[Match] Scheduler started');
}
