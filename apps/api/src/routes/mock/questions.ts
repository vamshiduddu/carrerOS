import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { listQuestionBank } from '../../services/mock.service';

export async function mockQuestionRoutes(app: FastifyInstance) {
	app.post('/:id/questions/:qId/answer', { preHandler: requireAuth }, async () => {
		return {
			feedback: 'Solid answer. Add one metric to strengthen impact.',
			score: 77,
			idealAnswer: 'A concise STAR answer with measurable impact.'
		};
	});

	app.get('/question-bank', { preHandler: requireAuth }, async () => {
		return listQuestionBank();
	});
}

