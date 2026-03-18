import { prisma } from '../config/database';

export async function listMockSessions(userId: string) {
	return prisma.mockInterviewSession.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
}

export async function createMockSession(userId: string) {
	const session = await prisma.mockInterviewSession.create({
		data: {
			userId,
			status: 'in_progress'
		}
	});

	await prisma.mockInterviewQuestion.createMany({
		data: [
			{ sessionId: session.id, question: 'Tell me about yourself.' },
			{ sessionId: session.id, question: 'Describe a challenging project you shipped.' },
			{ sessionId: session.id, question: 'Why do you want this role?' }
		]
	});

	return session;
}

export async function getMockSession(userId: string, id: string) {
	const session = await prisma.mockInterviewSession.findFirst({ where: { id, userId } });
	if (!session) {
		return null;
	}
	const questions = await prisma.mockInterviewQuestion.findMany({ where: { sessionId: id } });
	return { ...session, questions };
}

export async function deleteMockSession(userId: string, id: string) {
	const session = await prisma.mockInterviewSession.findFirst({ where: { id, userId } });
	if (!session) {
		return false;
	}
	await prisma.mockInterviewSession.delete({ where: { id } });
	return true;
}

export async function completeMockSession(userId: string, id: string) {
	const session = await prisma.mockInterviewSession.findFirst({ where: { id, userId } });
	if (!session) {
		return null;
	}
	return prisma.mockInterviewSession.update({ where: { id }, data: { status: 'completed' } });
}

export async function getMockReport(userId: string, id: string) {
	const session = await prisma.mockInterviewSession.findFirst({ where: { id, userId } });
	if (!session) {
		return null;
	}
	return {
		sessionId: id,
		score: 78,
		strengths: ['Clear structure', 'Good clarity'],
		improvements: ['Use more metrics', 'Tighter STAR stories']
	};
}

export async function listQuestionBank() {
	const existing = await prisma.questionBank.count();
	if (existing === 0) {
		await prisma.questionBank.createMany({
			data: [
				{ question: 'Walk me through your strongest project.', category: 'behavioral', difficulty: 'medium' },
				{ question: 'How do you design APIs for scale?', category: 'system_design', difficulty: 'hard' }
			]
		});
	}

	return prisma.questionBank.findMany({ orderBy: { createdAt: 'desc' } });
}

