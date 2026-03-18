import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { getBearerToken } from '../../middleware/auth';
import { verifyAccessToken } from '../../utils/jwt';
import { loginRoute } from './login';
import { logoutRoute } from './logout';
import { refreshRoute } from './refresh';
import { registerRoute } from './register';

export async function authRoutes(app: FastifyInstance) {
	await registerRoute(app);
	await loginRoute(app);
	await refreshRoute(app);
	await logoutRoute(app);

	app.get('/me', async (request, reply) => {
		const token = getBearerToken(request.headers.authorization);
		if (!token) {
			return reply.code(401).send({ error: 'Missing bearer token' });
		}

		try {
			const payload = verifyAccessToken(token);
			const user = await prisma.user.findUnique({
				where: { id: payload.sub },
				select: { id: true, email: true, fullName: true }
			});

			if (!user) {
				return reply.code(404).send({ error: 'User not found' });
			}

			return reply.send({ user });
		} catch {
			return reply.code(401).send({ error: 'Invalid token' });
		}
	});
}

