import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function generateOpaqueToken(bytes = 32): string {
	return randomBytes(bytes).toString('hex');
}

