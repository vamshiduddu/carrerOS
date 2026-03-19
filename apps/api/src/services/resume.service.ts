import { prisma } from '../config/database';

// ─── Resume CRUD ─────────────────────────────────────────────────────────────

export async function listResumes(userId: string) {
	return prisma.resume.findMany({
		where: { userId },
		orderBy: { updatedAt: 'desc' }
	});
}

export async function createResume(userId: string, input: { title: string }) {
	return prisma.resume.create({
		data: {
			userId,
			title: input.title
		}
	});
}

export async function getResumeById(userId: string, id: string) {
	return prisma.resume.findFirst({ where: { id, userId } });
}

export async function updateResume(userId: string, id: string, input: { title?: string }) {
	const existing = await prisma.resume.findFirst({ where: { id, userId } });
	if (!existing) {
		return null;
	}
	return prisma.resume.update({ where: { id }, data: input });
}

export async function deleteResume(userId: string, id: string) {
	const existing = await prisma.resume.findFirst({ where: { id, userId } });
	if (!existing) {
		return false;
	}
	await prisma.resume.delete({ where: { id } });
	return true;
}

// ─── Section CRUD ─────────────────────────────────────────────────────────────

export async function listSections(resumeId: string) {
	return prisma.resumeSection.findMany({
		where: { resumeId },
		orderBy: { sortOrder: 'asc' }
	});
}

export async function createSection(
	resumeId: string,
	data: { type: string; title: string; content?: string; sortOrder?: number }
) {
	return prisma.resumeSection.create({
		data: {
			resumeId,
			type: data.type,
			title: data.title,
			content: data.content,
			sortOrder: data.sortOrder ?? 0
		}
	});
}

export async function updateSection(
	sectionId: string,
	data: { title?: string; content?: string; sortOrder?: number }
) {
	return prisma.resumeSection.update({
		where: { id: sectionId },
		data
	});
}

export async function deleteSection(sectionId: string) {
	return prisma.resumeSection.delete({ where: { id: sectionId } });
}

// ─── Item CRUD ────────────────────────────────────────────────────────────────

export async function listItems(sectionId: string) {
	return prisma.resumeItem.findMany({
		where: { sectionId },
		orderBy: { sortOrder: 'asc' }
	});
}

export async function createItem(
	resumeId: string,
	sectionId: string,
	data: { sortOrder?: number; content?: Record<string, unknown> }
) {
	return prisma.resumeItem.create({
		data: {
			resumeId,
			sectionId,
			sortOrder: data.sortOrder ?? 0,
			...(data.content ? { content: data.content } : {})
		}
	});
}

export async function updateItem(itemId: string, data: { sortOrder?: number; content?: Record<string, unknown> }) {
	return prisma.resumeItem.update({
		where: { id: itemId },
		data
	});
}

export async function deleteItem(itemId: string) {
	return prisma.resumeItem.delete({ where: { id: itemId } });
}

// ─── ATS Scoring ──────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
	'about', 'above', 'after', 'also', 'been', 'before', 'being', 'between',
	'both', 'come', 'could', 'does', 'done', 'each', 'from', 'have', 'here',
	'into', 'just', 'know', 'like', 'make', 'more', 'most', 'much', 'need',
	'only', 'other', 'over', 'same', 'such', 'than', 'that', 'their', 'them',
	'then', 'there', 'these', 'they', 'this', 'time', 'very', 'want', 'well',
	'were', 'what', 'when', 'where', 'which', 'will', 'with', 'would', 'your'
]);

export async function scoreAts(
	resumeId: string,
	jobDescription: string
): Promise<{ score: number; found: string[]; missing: string[]; suggestions: string[] }> {
	// Fetch existing resume keywords and resume title
	const [resumeKeywordRecords] = await Promise.all([
		prisma.resumeKeyword.findMany({ where: { resumeId } })
	]);

	const resumeKeywordSet = new Set(
		resumeKeywordRecords.map((rk) => rk.keyword.toLowerCase())
	);

	// Extract keywords from the job description
	const rawTokens = jobDescription.split(/\W+/);
	const seen = new Set<string>();
	const jobKeywords: string[] = [];

	for (const token of rawTokens) {
		const lower = token.toLowerCase();
		if (lower.length > 4 && !STOP_WORDS.has(lower) && !seen.has(lower)) {
			seen.add(lower);
			jobKeywords.push(lower);
			if (jobKeywords.length >= 40) break;
		}
	}

	// Determine found / missing
	const found = jobKeywords.filter((kw) => resumeKeywordSet.has(kw));
	const missing = jobKeywords.filter((kw) => !resumeKeywordSet.has(kw));

	const total = jobKeywords.length;
	const rawScore = total > 0 ? (found.length / total) * 100 : 0;
	const score = Math.min(100, Math.max(0, Math.round(rawScore)));

	const suggestions = missing
		.slice(0, 5)
		.map((kw) => `Add '${kw}' to your skills or experience`);

	// Sync found keywords back to ResumeKeyword table.
	// "found" are already in the DB; ensure any job-description keywords
	// that matched are persisted in case they came from another source.
	// We check by lowercase comparison to avoid duplicates.
	const toInsert = found.filter((kw) => !resumeKeywordSet.has(kw));
	if (toInsert.length > 0) {
		await prisma.resumeKeyword.createMany({
			data: toInsert.map((kw) => ({ resumeId, keyword: kw }))
		});
	}

	return { score, found, missing, suggestions };
}

// ─── Resume Versions ──────────────────────────────────────────────────────────

export async function createVersion(userId: string, resumeId: string) {
	// Verify ownership
	const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
	if (!resume) {
		throw new Error('Resume not found');
	}

	// Fetch sections and items for snapshot
	const sections = await prisma.resumeSection.findMany({
		where: { resumeId },
		orderBy: { sortOrder: 'asc' }
	});

	const items = await prisma.resumeItem.findMany({
		where: { resumeId },
		orderBy: { sortOrder: 'asc' }
	});

	// Determine next version number
	const latest = await prisma.resumeVersion.findFirst({
		where: { resumeId },
		orderBy: { version: 'desc' }
	});
	const nextVersion = (latest?.version ?? 0) + 1;

	const snapshot = {
		resume: { id: resume.id, title: resume.title, updatedAt: resume.updatedAt },
		sections: sections.map((s) => ({
			id: s.id,
			type: s.type,
			title: s.title,
			sortOrder: s.sortOrder
		})),
		items: items.map((item) => ({
			id: item.id,
			sectionId: item.sectionId,
			sortOrder: item.sortOrder
		}))
	};

	return prisma.resumeVersion.create({
		data: {
			resumeId,
			version: nextVersion,
			snapshot
		}
	});
}

export async function listVersions(resumeId: string) {
	return prisma.resumeVersion.findMany({
		where: { resumeId },
		orderBy: { version: 'desc' }
	});
}

export async function getVersion(resumeId: string, versionId: string) {
	return prisma.resumeVersion.findFirst({
		where: { id: versionId, resumeId }
	});
}
