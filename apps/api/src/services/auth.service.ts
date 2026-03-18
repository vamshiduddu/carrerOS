import { prisma } from '../config/database';
import { generateOpaqueToken, hashPassword, hashToken, verifyPassword } from '../utils/crypto';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { sendVerificationEmail } from './email.service';

type RegisterInput = {
	email: string;
	password: string;
	fullName: string;
};

type LoginInput = {
	email: string;
	password: string;
};

export async function registerUser(input: RegisterInput) {
	const existing = await prisma.user.findUnique({ where: { email: input.email } });
	if (existing) {
		throw new Error('Email already exists');
	}

	const user = await prisma.user.create({
		data: {
			email: input.email,
			passwordHash: await hashPassword(input.password),
			fullName: input.fullName
		}
	});

	const rawVerifyToken = generateOpaqueToken();
	await prisma.user.update({
		where: { id: user.id },
		data: {
			emailVerifyToken: hashToken(rawVerifyToken),
			emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
		}
	});

	try {
		await sendVerificationEmail(
			user.email,
			user.fullName,
			rawVerifyToken,
			process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
		);
	} catch (err) {
		console.error('[registerUser] Failed to send verification email:', err);
	}

	const payload = { sub: user.id, email: user.email };
	const accessToken = signAccessToken(payload);
	const refreshToken = signRefreshToken(payload);

	await prisma.session.create({
		data: {
			userId: user.id,
			tokenHash: hashToken(refreshToken),
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		}
	});

	return {
		user: {
			id: user.id,
			email: user.email,
			fullName: user.fullName
		},
		accessToken,
		refreshToken
	};
}

export async function loginUser(input: LoginInput) {
	const user = await prisma.user.findUnique({ where: { email: input.email } });
	if (!user || !user.passwordHash) {
		throw new Error('Invalid credentials');
	}

	const valid = await verifyPassword(input.password, user.passwordHash);
	if (!valid) {
		throw new Error('Invalid credentials');
	}

	const payload = { sub: user.id, email: user.email };
	const accessToken = signAccessToken(payload);
	const refreshToken = signRefreshToken(payload);

	await prisma.session.create({
		data: {
			userId: user.id,
			tokenHash: hashToken(refreshToken),
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		}
	});

	return {
		user: {
			id: user.id,
			email: user.email,
			fullName: user.fullName
		},
		accessToken,
		refreshToken
	};
}

