import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { generateOpaqueToken, hashToken } from '../../utils/crypto';
import { sendPasswordResetEmail } from '../../services/email.service';

const bodySchema = z.object({
	email: z.string().email()
});

export async function forgotPasswordRoute(app: FastifyInstance) {
	app.post('/forgot-password', async (request, reply) => {
		const result = bodySchema.safeParse(request.body);
		if (!result.success) {
			return reply.code(400).send({ error: result.error.issues[0]?.message ?? 'Invalid input' });
		}

		const { email } = result.data;
		const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

		const user = await prisma.user.findUnique({ where: { email } });

		if (user) {
			const rawToken = generateOpaqueToken();
			const tokenHash = hashToken(rawToken);
			const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

			await prisma.user.update({
				where: { id: user.id },
				data: {
					passwordResetToken: tokenHash,
					passwordResetExpires: expires
				}
			});

			try {
				await sendPasswordResetEmail(user.email, user.fullName, rawToken, appUrl);
			} catch (err) {
				console.error('[forgot-password] Failed to send reset email:', err);
			}
		}

		return reply.send({
			ok: true,
			message: 'If that email exists, a reset link was sent.'
		});
	});
}
