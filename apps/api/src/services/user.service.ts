import { prisma } from '../config/database';

export async function getProfile(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			fullName: true,
			timezone: true,
			locale: true,
			onboardingComplete: true,
			onboardingStep: true,
			createdAt: true,
			updatedAt: true
		}
	});
}

export async function updateProfile(
	userId: string,
	data: { fullName?: string; timezone?: string; locale?: string }
) {
	return prisma.user.update({
		where: { id: userId },
		data,
		select: {
			id: true,
			email: true,
			fullName: true,
			timezone: true,
			locale: true,
			updatedAt: true
		}
	});
}

export async function getSettings(userId: string) {
	return prisma.userSetting.findUnique({ where: { userId } });
}

export async function updateSettings(userId: string) {
	return prisma.userSetting.upsert({
		where: { userId },
		create: { userId },
		update: {}
	});
}

