import { prisma } from '../config/database';

export async function listApplications(userId: string, status?: string) {
	return prisma.application.findMany({
		where: { userId, ...(status ? { status } : {}) },
		orderBy: { updatedAt: 'desc' }
	});
}

export async function createApplication(
	userId: string,
	data: { company: string; role: string; status?: string }
) {
	return prisma.application.create({
		data: {
			userId,
			company: data.company,
			role: data.role,
			status: data.status ?? 'saved'
		}
	});
}

export async function getApplication(userId: string, id: string) {
	return prisma.application.findFirst({ where: { id, userId } });
}

export async function updateApplication(
	userId: string,
	id: string,
	data: { company?: string; role?: string; status?: string }
) {
	const existing = await getApplication(userId, id);
	if (!existing) {
		return null;
	}
	return prisma.application.update({ where: { id }, data });
}

export async function removeApplication(userId: string, id: string) {
	const existing = await getApplication(userId, id);
	if (!existing) {
		return false;
	}
	await prisma.application.delete({ where: { id } });
	return true;
}

export async function addTimelineEvent(
	userId: string,
	applicationId: string,
	eventType: string,
	title: string
) {
	return prisma.applicationTimeline.create({
		data: {
			userId,
			applicationId,
			eventType,
			title
		}
	});
}

export async function listTimeline(userId: string, applicationId: string) {
	return prisma.applicationTimeline.findMany({
		where: { userId, applicationId },
		orderBy: { createdAt: 'desc' }
	});
}

export async function updateStatus(userId: string, applicationId: string, status: string) {
	const updated = await updateApplication(userId, applicationId, { status });
	if (!updated) {
		return null;
	}
	await addTimelineEvent(userId, applicationId, 'status_change', `Status changed to ${status}`);
	return updated;
}

export async function applicationStats(userId: string) {
	const applications = await prisma.application.findMany({ where: { userId } });
	const byStatus = applications.reduce<Record<string, number>>((acc, app) => {
		acc[app.status] = (acc[app.status] ?? 0) + 1;
		return acc;
	}, {});

	return {
		total: applications.length,
		byStatus
	};
}

