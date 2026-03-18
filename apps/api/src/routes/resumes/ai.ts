import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { getResumeById } from '../../services/resume.service';
import { chatWithFallback } from '../../services/ai/multi-model.service';

const improveSchema = z.object({
	text: z.string().min(1),
	instruction: z.string().optional()
});

export async function resumeAiRoutes(app: FastifyInstance) {
	app.post('/:resumeId/ai/improve', { preHandler: requireAuth }, async (request, reply) => {
		const { resumeId } = request.params as { resumeId: string };

		const resume = await getResumeById(request.user!.id, resumeId);
		if (!resume) return reply.code(404).send({ error: 'Resume not found' });

		let body: z.infer<typeof improveSchema>;
		try {
			body = improveSchema.parse(request.body);
		} catch {
			return reply.code(400).send({ error: 'Invalid payload: text is required' });
		}

		const systemPrompt = 'You are an expert resume writer. When given resume text, rewrite it to be more professional, impactful, and ATS-friendly. Use strong action verbs, quantify results where possible. Return ONLY the improved text — no explanations, no commentary.';

		const userPrompt = body.instruction
			? `Improve this resume text. Instruction: "${body.instruction}"\n\nText:\n${body.text}`
			: `Improve this resume bullet point to be more impactful and achievement-oriented:\n\n${body.text}`;

		try {
			const result = await chatWithFallback(
				[
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				{ temperature: 0.5, preferredProvider: 'anthropic' }
			);
			return reply.send({ improved: result.text.trim() });
		} catch (error) {
			const message = error instanceof Error ? error.message : 'AI improvement failed';
			return reply.code(500).send({ error: message });
		}
	});
}
