import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { chatWithModel, chatWithFallback, listModelProviders } from '../../services/ai/multi-model.service';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1)
});

const chatSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  temperature: z.number().min(0).max(2).optional(),
  messages: z.array(messageSchema).min(1)
});

export async function aiRoutes(app: FastifyInstance) {
  app.get('/providers', { preHandler: requireAuth }, async () => {
    return { providers: listModelProviders() };
  });

  app.post('/chat', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const body = chatSchema.parse(request.body);

      let result;
      if (body.provider && body.model) {
        // Specific provider requested — try it, fall back if it fails
        try {
          result = await chatWithModel({ provider: body.provider, model: body.model, apiKey: body.apiKey, baseUrl: body.baseUrl, temperature: body.temperature, messages: body.messages });
        } catch {
          result = await chatWithFallback(body.messages, { temperature: body.temperature, preferredProvider: body.provider });
        }
      } else {
        // No provider specified — use fallback chain
        result = await chatWithFallback(body.messages, { temperature: body.temperature });
      }

      return reply.send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI chat failed';
      return reply.code(400).send({ error: message });
    }
  });
}
