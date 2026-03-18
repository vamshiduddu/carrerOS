import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { hashToken } from '../../utils/crypto';

const logoutSchema = z.object({
	refreshToken: z.string().min(20)
});

export async function logoutRoute(app: FastifyInstance) {
	app.post('/logout', async (request, reply) => {
		try {
			const body = logoutSchema.parse(request.body);
			const tokenHash = hashToken(body.refreshToken);
			await prisma.session.deleteMany({ where: { tokenHash } });
			return reply.send({ ok: true });
		} catch {
			return reply.code(400).send({ error: 'Logout failed' });
		}
	});
}

