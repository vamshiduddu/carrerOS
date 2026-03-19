import { prisma } from '../config/database';

type ListJobsInput = {
  q?: string;
  limit?: number;
};

export async function listJobs(input: ListJobsInput) {
  const where = input.q
    ? {
        OR: [
          { title: { contains: input.q, mode: 'insensitive' as const } },
          { company: { contains: input.q, mode: 'insensitive' as const } },
          { location: { contains: input.q, mode: 'insensitive' as const } }
        ]
      }
    : undefined;

  const take = Math.min(Math.max(input.limit ?? 20, 1), 100);
  return prisma.jobListing.findMany({ where, take, orderBy: { createdAt: 'desc' } });
}

export async function getJob(jobId: string) {
  return prisma.jobListing.findUnique({ where: { id: jobId } });
}

export async function searchJobs(query: string) {
  return listJobs({ q: query, limit: 20 });
}

export async function getJobPreferences(userId: string) {
  return prisma.userJobPreference.findUnique({ where: { userId } });
}
