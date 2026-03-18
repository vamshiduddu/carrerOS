import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import {
	createOrChangeSubscription,
	getPlans,
	getUserSubscription
} from '../../services/billing.service';

const checkoutSchema = z.object({
	planId: z.string().uuid()
});

export async function billingPlanRoutes(app: FastifyInstance) {
	app.get('/plans', async () => {
		return getPlans();
	});

	app.get('/subscription', { preHandler: requireAuth }, async (request) => {
		return getUserSubscription(request.user!.id);
	});

	app.post('/checkout', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const body = checkoutSchema.parse(request.body);
			const subscription = await createOrChangeSubscription(request.user!.id, body.planId);
			return reply.send({ subscription, checkoutUrl: '/mock-checkout-success' });
		} catch {
			return reply.code(400).send({ error: 'Invalid checkout payload' });
		}
	});
}

