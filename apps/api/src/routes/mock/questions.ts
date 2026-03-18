import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { listQuestionBank } from '../../services/mock.service';
import { generateMockFeedback } from '../../services/ai/interview-ai.service';
import { prisma } from '../../config/database';

const answerSchema = z.object({
	answer: z.string().min(1)
});

export async function mockQuestionRoutes(app: FastifyInstance) {
	app.post('/:id/questions/:qId/answer', { preHandler: requireAuth }, async (request, reply) => {
		const { id, qId } = request.params as { id: string; qId: string };

		let body: { answer: string };
		try {
			body = answerSchema.parse(request.body);
		} catch {
			return reply.code(400).send({ error: 'answer is required' });
		}

		// Fetch the question text
		const question = await prisma.mockInterviewQuestion.findFirst({ where: { id: qId, sessionId: id } });
		if (!question) {
			return reply.code(404).send({ error: 'Question not found' });
		}

		// Fetch session to get context
		const session = await prisma.mockInterviewSession.findFirst({ where: { id } });
		const interviewType = session ? 'behavioral' : 'behavioral';

		const feedback = await generateMockFeedback(question.question, body.answer, interviewType);
		return reply.send(feedback);
	});

	app.get('/question-bank', { preHandler: requireAuth }, async () => {
		return listQuestionBank();
	});
}
