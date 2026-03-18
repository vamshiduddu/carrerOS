import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { addInterviewTurn, listInterviewTurns } from '../../services/interview.service';

export async function interviewTurnRoutes(app: FastifyInstance) {
	app.get('/:id/turns', { preHandler: requireAuth }, async (request) => {
		const params = request.params as { id: string };
		return listInterviewTurns(params.id);
	});

	app.post('/:id/transcribe', { preHandler: requireAuth }, async (request) => {
		const params = request.params as { id: string };
		await addInterviewTurn(params.id, 'user', 'Mock transcribed answer');
		return { transcription: 'Mock transcribed answer' };
	});
}

