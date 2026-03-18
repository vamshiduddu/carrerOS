import { prisma } from '../config/database';

export function computeMatchScore(
  jobTitle: string,
  jobDescription: string,
  userKeywords: string[]
): number {
  if (userKeywords.length === 0) return 0;

  const haystack = `${jobTitle} ${jobDescription}`.toLowerCase();
  let matched = 0;

  for (const keyword of userKeywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      matched++;
    }
  }

  const ratio = matched / userKeywords.length;
  return Math.round(ratio * 100);
}

export async function matchJobsForUser(userId: string): Promise<void> {
  // Get all resumes for user
  const resumes = await prisma.resume.findMany({
    where: { userId },
    select: { id: true }
  });

  const resumeIds = resumes.map((r) => r.id);

  // Get all keywords across user's resumes
  const resumeKeywords = await prisma.resumeKeyword.findMany({
    where: { resumeId: { in: resumeIds } },
    select: { keyword: true }
  });

  const keywords = [...new Set(resumeKeywords.map((rk) => rk.keyword))];

  const jobs = await prisma.jobListing.findMany();

  for (const job of jobs) {
    const score = computeMatchScore(job.title, '', keywords);

    const existing = await prisma.jobMatch.findFirst({
      where: { userId, jobId: job.id },
      select: { id: true }
    });

    if (existing) {
      await prisma.jobMatch.update({
        where: { id: existing.id },
        data: { matchScore: score }
      });
    } else {
      await prisma.jobMatch.create({
        data: { userId, jobId: job.id, matchScore: score }
      });
    }
  }
}
