import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../utils/jwt';

export function getBearerToken(authorization?: string): string | null {
	if (!authorization) {
		return null;
	}

	const [scheme, token] = authorization.split(' ');
	if (scheme?.toLowerCase() !== 'bearer' || !token) {
		return null;
	}

	return token;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
	const token = getBearerToken(request.headers.authorization);
	if (!token) {
		return reply.code(401).send({ error: 'Missing bearer token' });
	}

	try {
		const payload = verifyAccessToken(token);
		request.user = {
			id: payload.sub,
			email: payload.email
		};
	} catch {
		return reply.code(401).send({ error: 'Invalid token' });
	}
}

