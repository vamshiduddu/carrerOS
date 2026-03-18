import { prisma } from '../config/database';

type ListJobsInput = {
	q?: string;
	limit?: number;
};

const seedJobs = [
	{
		source: 'manual',
		url: 'https://example.com/jobs/frontend-engineer',
		title: 'Frontend Engineer',
		company: 'Northstar Labs'
	},
	{
		source: 'manual',
		url: 'https://example.com/jobs/backend-engineer',
		title: 'Backend Engineer',
		company: 'Orbit Systems'
	},
	{
		source: 'manual',
		url: 'https://example.com/jobs/fullstack-engineer',
		title: 'Fullstack Engineer',
		company: 'Summit Platform'
	}
];

export async function ensureJobSeeds() {
	const count = await prisma.jobListing.count();
	if (count > 0) {
		return;
	}
	await prisma.jobListing.createMany({ data: seedJobs });
}

export async function listJobs(input: ListJobsInput) {
	await ensureJobSeeds();
	const where = input.q
		? {
				OR: [
					{ title: { contains: input.q, mode: 'insensitive' as const } },
					{ company: { contains: input.q, mode: 'insensitive' as const } }
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

export async function getOrCreateMatches(userId: string) {
	await ensureJobSeeds();
	const existing = await prisma.jobMatch.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
	if (existing.length > 0) {
		return existing;
	}

	const jobs = await prisma.jobListing.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
	const created = [];
	for (const job of jobs) {
		const match = await prisma.jobMatch.create({
			data: {
				userId,
				jobId: job.id,
				matchScore: 70
			}
		});
		created.push(match);
	}
	return created;
}

export async function getJobPreferences(userId: string) {
	return prisma.userJobPreference.findUnique({ where: { userId } });
}

export async function upsertJobPreferences(userId: string) {
	return prisma.userJobPreference.upsert({
		where: { userId },
		create: { userId },
		update: {}
	});
}

