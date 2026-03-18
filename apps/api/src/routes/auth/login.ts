import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { loginUser } from '../../services/auth.service';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export async function loginRoute(app: FastifyInstance) {
	app.post('/login', async (request, reply) => {
		try {
			const body = loginSchema.parse(request.body);
			const result = await loginUser(body);
			return reply.code(200).send(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Login failed';
			return reply.code(401).send({ error: message });
		}
	});
}

