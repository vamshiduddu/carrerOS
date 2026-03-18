import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { hashToken } from '../../utils/crypto';

const bodySchema = z.object({
	token: z.string().min(1)
});

export async function verifyEmailRoute(app: FastifyInstance) {
	app.post('/verify-email', async (request, reply) => {
		const result = bodySchema.safeParse(request.body);
		if (!result.success) {
			return reply.code(400).send({ error: result.error.issues[0]?.message ?? 'Invalid input' });
		}

		const { token } = result.data;
		const tokenHash = hashToken(token);

		try {
			const user = await prisma.user.findFirst({
				where: { emailVerifyToken: tokenHash }
			});

			if (!user) {
				return reply.code(400).send({ error: 'Invalid or expired verification token.' });
			}

			if (!user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
				return reply.code(400).send({ error: 'Email verification token has expired.' });
			}

			await prisma.user.update({
				where: { id: user.id },
				data: {
					emailVerified: true,
					emailVerifyToken: null,
					emailVerifyExpires: null
				}
			});

			return reply.send({ ok: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
			return reply.code(400).send({ error: message });
		}
	});
}
