import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { getProfile, updateProfile } from '../../services/user.service';

const updateProfileSchema = z.object({
	fullName: z.string().min(2).optional(),
	timezone: z.string().min(1).optional(),
	locale: z.string().min(1).optional()
});

export async function profileRoutes(app: FastifyInstance) {
	app.get('/profile', { preHandler: requireAuth }, async (request, reply) => {
		const profile = await getProfile(request.user!.id);
		if (!profile) {
			return reply.code(404).send({ error: 'User not found' });
		}
		return reply.send(profile);
	});

	app.patch('/profile', { preHandler: requireAuth }, async (request, reply) => {
		try {
			const body = updateProfileSchema.parse(request.body);
			const updated = await updateProfile(request.user!.id, body);
			return reply.send(updated);
		} catch {
			return reply.code(400).send({ error: 'Invalid profile payload' });
		}
	});
}

