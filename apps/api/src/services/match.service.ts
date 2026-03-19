import { prisma } from '../config/database';
import { fetchLiveJobsForPreferences } from './live-jobs.service';

export function computeMatchScore(
  job: { title: string; description?: string | null; tags: string[]; remote: boolean; jobType?: string | null },
  prefs: { titles: string[]; keywords: string[]; remote: boolean; jobTypes: string[]; locations: string[] }
): number {
  let score = 0;
  const haystack = `${job.title} ${job.description ?? ''} ${job.tags.join(' ')}`.toLowerCase();

  // Title match (up to 40 pts)
  for (const t of prefs.titles) {
    if (haystack.includes(t.toLowerCase())) { score += 40; break; }
  }

  // Keyword match (up to 40 pts)
  if (prefs.keywords.length > 0) {
    const matched = prefs.keywords.filter((k) => haystack.includes(k.toLowerCase())).length;
    score += Math.round((matched / prefs.keywords.length) * 40);
  }

  // Remote match (10 pts)
  if (prefs.remote && job.remote) score += 10;

  // Job type match (10 pts)
  if (prefs.jobTypes.length > 0 && job.jobType) {
    if (prefs.jobTypes.some((t) => job.jobType!.toLowerCase().includes(t.toLowerCase()))) score += 10;
  }

  return Math.min(score, 100);
}

const DEFAULT_PREFS = {
  titles: ['software engineer', 'frontend engineer', 'backend engineer', 'fullstack engineer'],
  keywords: ['javascript', 'python', 'react', 'node'],
  remote: false,
  jobTypes: ['full-time'],
  locations: ['USA', 'United States', 'New York', 'San Francisco', 'Remote']
};

export async function matchJobsForUser(userId: string): Promise<void> {
  const prefs = await prisma.userJobPreference.findUnique({ where: { userId } });

  const prefData = prefs && prefs.titles.length > 0 ? {
    titles: prefs.titles,
    keywords: prefs.keywords,
    remote: prefs.remote,
    jobTypes: prefs.jobTypes,
    locations: prefs.locations
  } : DEFAULT_PREFS;

  // Fetch live jobs and upsert into DB
  await fetchLiveJobsForPreferences(prefData);

  // Score all jobs in DB
  const jobs = await prisma.jobListing.findMany({ take: 200, orderBy: { createdAt: 'desc' } });

  for (const job of jobs) {
    const score = computeMatchScore(
      { title: job.title, description: job.description, tags: job.tags, remote: job.remote, jobType: job.jobType },
      prefData
    );
    if (score === 0) continue;

    await prisma.jobMatch.upsert({
      where: { userId_jobId: { userId, jobId: job.id } },
      create: { userId, jobId: job.id, matchScore: score },
      update: { matchScore: score }
    });
  }
}

// Called when preferences are updated — runs matching and returns top matches
export async function refreshMatchesForUser(userId: string) {
  await matchJobsForUser(userId);

  const matches = await prisma.jobMatch.findMany({
    where: { userId },
    orderBy: { matchScore: 'desc' },
    take: 50
  });

  const jobIds = matches.map((m) => m.jobId);
  const jobs = await prisma.jobListing.findMany({ where: { id: { in: jobIds } } });
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  return matches
    .map((m) => ({ ...m, matchScore: Number(m.matchScore), job: jobMap.get(m.jobId) ?? null }))
    .filter((m) => m.job !== null);
}
