import { prisma } from '../config/database';

export async function listResumes(userId: string) {
	return prisma.resume.findMany({
		where: { userId },
		orderBy: { updatedAt: 'desc' }
	});
}

export async function createResume(userId: string, input: { title: string }) {
	return prisma.resume.create({
		data: {
			userId,
			title: input.title
		}
	});
}

export async function getResumeById(userId: string, id: string) {
	return prisma.resume.findFirst({ where: { id, userId } });
}

export async function updateResume(userId: string, id: string, input: { title?: string }) {
	const existing = await prisma.resume.findFirst({ where: { id, userId } });
	if (!existing) {
		return null;
	}
	return prisma.resume.update({ where: { id }, data: input });
}

export async function deleteResume(userId: string, id: string) {
	const existing = await prisma.resume.findFirst({ where: { id, userId } });
	if (!existing) {
		return false;
	}
	await prisma.resume.delete({ where: { id } });
	return true;
}

