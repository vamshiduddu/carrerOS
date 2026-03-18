import { prisma } from '../config/database';

export async function listInterviewSessions(userId: string) {
	return prisma.interviewSession.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
}

export async function createInterviewSession(
	userId: string,
	data: { title: string; interviewType: string }
) {
	return prisma.interviewSession.create({
		data: {
			userId,
			title: data.title,
			interviewType: data.interviewType,
			status: 'scheduled'
		}
	});
}

export async function getInterviewSession(userId: string, id: string) {
	return prisma.interviewSession.findFirst({ where: { id, userId } });
}

export async function deleteInterviewSession(userId: string, id: string) {
	const existing = await getInterviewSession(userId, id);
	if (!existing) {
		return false;
	}
	await prisma.interviewSession.delete({ where: { id } });
	return true;
}

export async function setInterviewStatus(userId: string, id: string, status: string) {
	const existing = await getInterviewSession(userId, id);
	if (!existing) {
		return null;
	}
	return prisma.interviewSession.update({ where: { id }, data: { status } });
}

export async function listInterviewTurns(sessionId: string) {
	return prisma.interviewTurn.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });
}

export async function addInterviewTurn(sessionId: string, role: string, content: string) {
	return prisma.interviewTurn.create({ data: { sessionId, role, content } });
}

