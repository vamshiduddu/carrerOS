import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { chatWithModel, listModelProviders } from '../../services/ai/multi-model.service';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1)
});

const chatSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
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
      const result = await chatWithModel(body);
      return reply.send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI chat failed';
      return reply.code(400).send({ error: message });
    }
  });
}
