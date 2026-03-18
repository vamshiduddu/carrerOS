import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { registerUser } from '../../services/auth.service';

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	fullName: z.string().min(2)
});

export async function registerRoute(app: FastifyInstance) {
	app.post('/register', async (request, reply) => {
		try {
			const body = registerSchema.parse(request.body);
			const result = await registerUser(body);
			return reply.code(201).send(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Registration failed';
			return reply.code(400).send({ error: message });
		}
	});
}

