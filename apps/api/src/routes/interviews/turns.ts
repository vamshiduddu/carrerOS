import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { addInterviewTurn, listInterviewTurns, getInterviewSession } from '../../services/interview.service';
import { generateInterviewReply } from '../../services/ai/interview-ai.service';

const turnSchema = z.object({
	role: z.enum(['user', 'assistant']),
	content: z.string().min(1),
});

export async function interviewTurnRoutes(app: FastifyInstance) {
	app.get('/:id/turns', { preHandler: requireAuth }, async (request) => {
		const params = request.params as { id: string };
		return listInterviewTurns(params.id);
	});

	app.post('/:id/turns', { preHandler: requireAuth }, async (request, reply) => {
		const params = request.params as { id: string };

		let body: { role: 'user' | 'assistant'; content: string };
		try {
			body = turnSchema.parse(request.body);
		} catch {
			return reply.code(400).send({ error: 'Invalid payload' });
		}

		const session = await getInterviewSession(request.user!.id, params.id);
		if (!session) {
			return reply.code(404).send({ error: 'Session not found' });
		}

		// Save user turn
		const turn = await addInterviewTurn(params.id, body.role, body.content);

		// Generate AI reply
		try {
			const history = await listInterviewTurns(params.id);
			const aiText = await generateInterviewReply(
				session.title,
				session.interviewType,
				history.map(t => ({ role: t.role as 'user' | 'assistant', content: t.content }))
			);
			const aiTurn = await addInterviewTurn(params.id, 'assistant', aiText);
			return { turn, reply: aiTurn };
		} catch {
			return { turn, reply: null };
		}
	});

	app.post('/:id/transcribe', { preHandler: requireAuth }, async (request) => {
		const params = request.params as { id: string };
		await addInterviewTurn(params.id, 'user', 'Mock transcribed answer');
		return { transcription: 'Mock transcribed answer' };
	});
}
