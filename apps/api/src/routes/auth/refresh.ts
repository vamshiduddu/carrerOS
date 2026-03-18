import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { hashToken } from '../../utils/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';

const refreshSchema = z.object({
	refreshToken: z.string().min(20)
});

export async function refreshRoute(app: FastifyInstance) {
	app.post('/refresh', async (request, reply) => {
		try {
			const body = refreshSchema.parse(request.body);
			const payload = verifyRefreshToken(body.refreshToken);
			const oldHash = hashToken(body.refreshToken);

			const existing = await prisma.session.findUnique({ where: { tokenHash: oldHash } });
			if (!existing || existing.expiresAt < new Date()) {
				return reply.code(401).send({ error: 'Invalid refresh token' });
			}

			await prisma.session.delete({ where: { id: existing.id } });

			const accessToken = signAccessToken({ sub: payload.sub, email: payload.email });
			const refreshToken = signRefreshToken({ sub: payload.sub, email: payload.email });

			await prisma.session.create({
				data: {
					userId: payload.sub,
					tokenHash: hashToken(refreshToken),
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				}
			});

			return reply.send({ accessToken, refreshToken });
		} catch {
			return reply.code(401).send({ error: 'Refresh failed' });
		}
	});
}

