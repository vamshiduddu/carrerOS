import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { getResumeById, listSections, listItems } from '../../services/resume.service';

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function buildResumeHtml(
	title: string,
	sections: Array<{ id: string; type: string; title: string; sortOrder: number }>,
	items: Array<{ id: string; sectionId: string; sortOrder: number }>
): string {
	const itemsBySectionId = new Map<string, typeof items>();
	for (const item of items) {
		const list = itemsBySectionId.get(item.sectionId) ?? [];
		list.push(item);
		itemsBySectionId.set(item.sectionId, list);
	}

	const sectionsHtml = sections
		.map((section) => {
			const sectionItems = itemsBySectionId.get(section.id) ?? [];
			const itemsHtml =
				sectionItems.length > 0
					? `<ul>${sectionItems
							.map((i) => `<li>Item ${escapeHtml(i.id.slice(0, 8))}</li>`)
							.join('')}</ul>`
					: '<p><em>No items in this section.</em></p>';

			return `
    <section class="resume-section">
      <h2>${escapeHtml(section.title)}</h2>
      <div class="section-type">${escapeHtml(section.type)}</div>
      ${itemsHtml}
    </section>`;
		})
		.join('\n');

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      font-size: 12pt;
      color: #111;
      background: #fff;
      padding: 40px 60px;
      max-width: 820px;
      margin: 0 auto;
    }
    h1.resume-title {
      font-size: 24pt;
      font-weight: bold;
      border-bottom: 2px solid #333;
      padding-bottom: 8px;
      margin-bottom: 24px;
    }
    .resume-section {
      margin-bottom: 20px;
    }
    .resume-section h2 {
      font-size: 14pt;
      font-weight: bold;
      border-bottom: 1px solid #999;
      padding-bottom: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .section-type {
      font-size: 9pt;
      color: #666;
      margin-bottom: 6px;
      font-style: italic;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
      line-height: 1.5;
    }
    @media print {
      body { padding: 20px 40px; }
      .resume-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1 class="resume-title">${escapeHtml(title)}</h1>
  ${sectionsHtml || '<p><em>No sections yet. Add sections to build your resume.</em></p>'}
</body>
</html>`;
}

export async function resumePdfRoutes(app: FastifyInstance) {
	// GET /resumes/:resumeId/pdf
	app.get('/:resumeId/pdf', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId } = request.params as { resumeId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) {
			return reply.code(404).send({ error: 'Resume not found' });
		}

		// Fetch sections first, then fetch items for each section in parallel
		const sections = await listSections(resumeId);
		const itemArrays = await Promise.all(sections.map((s) => listItems(s.id)));
		const items = itemArrays.flat();

		const html = buildResumeHtml(resume.title, sections, items);

		const safeTitle = resume.title.replace(/[^a-z0-9_\- ]/gi, '_');
		reply.header('Content-Type', 'text/html; charset=utf-8');
		reply.header('Content-Disposition', `inline; filename="${safeTitle}.pdf"`);
		return reply.send(html);
	});
}
