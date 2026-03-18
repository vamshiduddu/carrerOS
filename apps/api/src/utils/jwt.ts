import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AuthTokenPayload = {
	sub: string;
	email: string;
};

export function signAccessToken(payload: AuthTokenPayload): string {
	return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
		expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
	});
}

export function signRefreshToken(payload: AuthTokenPayload): string {
	return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
		expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']
	});
}

export function verifyAccessToken(token: string): AuthTokenPayload {
	return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
	return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;
}

