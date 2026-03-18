import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { hashPassword, hashToken } from '../../utils/crypto';

const bodySchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8)
});

export async function resetPasswordRoute(app: FastifyInstance) {
	app.post('/reset-password', async (request, reply) => {
		const result = bodySchema.safeParse(request.body);
		if (!result.success) {
			return reply.code(400).send({ error: result.error.issues[0]?.message ?? 'Invalid input' });
		}

		const { token, password } = result.data;
		const tokenHash = hashToken(token);

		try {
			const user = await prisma.user.findFirst({
				where: { passwordResetToken: tokenHash }
			});

			if (!user) {
				return reply.code(400).send({ error: 'Invalid or expired reset token.' });
			}

			if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
				return reply.code(400).send({ error: 'Password reset token has expired.' });
			}

			const newPasswordHash = await hashPassword(password);

			await prisma.user.update({
				where: { id: user.id },
				data: {
					passwordHash: newPasswordHash,
					passwordResetToken: null,
					passwordResetExpires: null
				}
			});

			return reply.send({ ok: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
			return reply.code(400).send({ error: message });
		}
	});
}
