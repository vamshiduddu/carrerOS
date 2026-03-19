import type { FastifyInstance } from 'fastify';
import PDFDocument from 'pdfkit';
import { requireAuth } from '../../middleware/auth';
import { getResumeById, listSections } from '../../services/resume.service';

const PAGE_MARGIN = 50;
const TEXT_WIDTH = 595.28 - PAGE_MARGIN * 2; // A4 width minus margins

// Parse a content block into structured entry lines
// Expects lines like:
//   "Title | Organization"          ← entry heading
//   "Location | Jan 2020 – May 2022" ← meta line
//   "• Bullet text"                  ← bullet
//   "Plain paragraph text"           ← paragraph
type LineKind = 'heading' | 'meta' | 'bullet' | 'paragraph';

function classifyLine(line: string): LineKind {
	if (/^[\*\-\•]/.test(line)) return 'bullet';
	if (/\|\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(line)) return 'meta';
	if (/\|\s*\w/.test(line) && line.split('|').length === 2) return 'heading';
	if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(line)) return 'meta';
	return 'paragraph';
}

function renderSectionContent(doc: PDFKit.PDFDocument, content: string) {
	const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
	if (lines.length === 0) return;

	for (const line of lines) {
		const kind = classifyLine(line);
		const clean = line.replace(/^[\*\-\•]\s*/, '');

		if (kind === 'heading') {
			// "Role | Company" → left=Role bold, right=Company
			const [left, right] = line.split('|').map((s) => s.trim());
			doc.moveDown(0.15);
			const rightWidth = doc.widthOfString(right ?? '');
			doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000')
				.text(left, PAGE_MARGIN, doc.y, { continued: true, width: TEXT_WIDTH - rightWidth });
			doc.font('Helvetica').fontSize(10).fillColor('#333333')
				.text(right ?? '', { align: 'right' });
		} else if (kind === 'meta') {
			// "Location | Date" → left=Location italic, right=Date italic
			const parts = line.split('|').map((s) => s.trim());
			const [left, right] = parts.length === 2 ? parts : ['', parts[0]];
			const rightWidth = doc.widthOfString(right ?? '');
			doc.font('Helvetica-Oblique').fontSize(9).fillColor('#444444')
				.text(left, PAGE_MARGIN, doc.y, { continued: true, width: TEXT_WIDTH - rightWidth });
			doc.font('Helvetica-Oblique').fontSize(9).fillColor('#444444')
				.text(right ?? '', { align: 'right' });
			doc.moveDown(0.1);
		} else if (kind === 'bullet') {
			doc.font('Helvetica').fontSize(10).fillColor('#000000')
				.text(`\u2022  ${clean}`, { indent: 12, lineGap: 2 });
		} else {
			doc.font('Helvetica').fontSize(10).fillColor('#000000')
				.text(clean, { lineGap: 2 });
		}
	}
}

function drawSectionHeading(doc: PDFKit.PDFDocument, title: string) {
	doc.moveDown(0.5);
	doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000')
		.text(title.toUpperCase(), PAGE_MARGIN, doc.y, {
			characterSpacing: 0.6,
			width: TEXT_WIDTH
		});
	const lineY = doc.y + 2;
	doc.moveTo(PAGE_MARGIN, lineY).lineTo(PAGE_MARGIN + TEXT_WIDTH, lineY)
		.strokeColor('#000000').lineWidth(0.8).stroke();
	doc.moveDown(0.35);
}

export async function resumePdfRoutes(app: FastifyInstance) {
	const handler = async (request: any, reply: any) => {
		const { resumeId } = request.params as { resumeId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) return reply.code(404).send({ error: 'Resume not found' });

		const allSections = await listSections(resumeId);
		const sections = allSections.filter((s) => {
			const content = (s as any).content as string | null;
			return content && content.trim().length > 0;
		});

		const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'LETTER' });
		const chunks: Buffer[] = [];
		doc.on('data', (chunk: Buffer) => chunks.push(chunk));

		await new Promise<void>((resolve) => {
			doc.on('end', resolve);

			// ── Name Header ─────────────────────────────────────────────
			doc.font('Helvetica-Bold').fontSize(22).fillColor('#000000')
				.text(resume.title, { align: 'center' });
			doc.moveDown(0.1);

			// Thin rule under name
			const nameRuleY = doc.y;
			doc.moveTo(PAGE_MARGIN, nameRuleY)
				.lineTo(PAGE_MARGIN + TEXT_WIDTH, nameRuleY)
				.strokeColor('#000000').lineWidth(0.5).stroke();
			doc.moveDown(0.5);

			if (sections.length === 0) {
				doc.font('Helvetica').fontSize(11).fillColor('#666666')
					.text('No content added yet.', { align: 'center' });
			}

			// ── Sections ────────────────────────────────────────────────
			for (const section of sections) {
				const content = (section as any).content as string;

				// Contact / Summary sections get simpler rendering
				const titleLower = section.title.toLowerCase();
				const isContact = titleLower.includes('contact') || titleLower.includes('header');

				if (isContact) {
					// Render contact info as a centered single line
					const flat = content.split('\n').map((l) => l.trim()).filter(Boolean).join('  |  ');
					doc.font('Helvetica').fontSize(9.5).fillColor('#333333')
						.text(flat, { align: 'center' });
					doc.moveDown(0.3);
				} else {
					drawSectionHeading(doc, section.title);
					renderSectionContent(doc, content);
				}
			}

			doc.end();
		});

		const pdfBuffer = Buffer.concat(chunks);
		const safeTitle = resume.title.replace(/[^a-z0-9_\- ]/gi, '_');
		reply.header('Content-Type', 'application/pdf');
		reply.header('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
		reply.header('Content-Length', pdfBuffer.length);
		return reply.send(pdfBuffer);
	};

	app.get('/:resumeId/pdf', { preHandler: requireAuth }, handler);
	app.post('/:resumeId/pdf', { preHandler: requireAuth }, handler);
}
