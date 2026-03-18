import { prisma } from '../config/database';

const planSeeds = [
	{
		name: 'free',
		displayName: 'Free',
		priceMonthly: 0,
		priceYearly: 0,
		features: { resumes: 1, ats: false },
		limits: { resumes: 1, applications: 10 }
	},
	{
		name: 'starter',
		displayName: 'Starter',
		priceMonthly: 1900,
		priceYearly: 15200,
		features: { resumes: 3, ats: true },
		limits: { resumes: 3, applications: 100 }
	},
	{
		name: 'pro',
		displayName: 'Pro',
		priceMonthly: 3900,
		priceYearly: 31200,
		features: { resumes: 10, ats: true, autoApply: true },
		limits: { resumes: 10, applications: 500 }
	}
];

export async function ensurePlanSeeds() {
	for (const plan of planSeeds) {
		const existing = await prisma.subscriptionPlan.findFirst({ where: { name: plan.name } });
		if (!existing) {
			await prisma.subscriptionPlan.create({ data: plan });
		}
	}
}

export async function getPlans() {
	await ensurePlanSeeds();
	return prisma.subscriptionPlan.findMany({ orderBy: { priceMonthly: 'asc' } });
}

export async function getUserSubscription(userId: string) {
	const subscription = await prisma.subscription.findUnique({ where: { userId } });
	const plan = subscription
		? await prisma.subscriptionPlan.findUnique({ where: { id: subscription.planId } })
		: null;

	const usage = await prisma.usageRecord.findFirst({
		where: { userId },
		orderBy: { createdAt: 'desc' }
	});

	return {
		subscription: subscription ? { ...subscription, plan } : null,
		usage
	};
}

export async function createOrChangeSubscription(userId: string, planId: string) {
	const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
	if (!plan) {
		throw new Error('Plan not found');
	}

	return prisma.subscription.upsert({
		where: { userId },
		create: {
			userId,
			planId,
			status: 'active'
		},
		update: {
			planId,
			status: 'active'
		}
	});
}

