import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
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

  // Vision: solve coding problem from screenshot — tries Anthropic → Gemini in order
  app.post('/solve-screen', { preHandler: requireAuth }, async (request, reply) => {
    const { imageBase64, context } = request.body as { imageBase64: string; context?: string };
    if (!imageBase64) return reply.code(400).send({ error: 'imageBase64 required' });

    const prompt = `Look at this screenshot. Identify the coding problem and give me ONLY the solution code. No explanation, no approach, no complexity analysis. Just clean working code I can copy-paste.

\`\`\`
[complete solution code here]
\`\`\`

If there are multiple approaches, give the most optimal one only.${context ? `\nJob context: ${context}` : ''}`;

    // Try Anthropic first
    if (env.ANTHROPIC_API_KEY) {
      try {
        const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: prompt }
          ]}]
        });
        const solution = response.content[0].type === 'text' ? response.content[0].text : '';
        return reply.send({ solution, provider: 'anthropic' });
      } catch (err) {
        console.warn('[solve-screen] Anthropic failed:', (err as Error).message, '— trying OpenAI');
      }
    }

    // Fall back to OpenAI GPT-4o (supports vision)
    if (env.OPENAI_API_KEY) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
          body: JSON.stringify({
            model: 'gpt-4o',
            max_tokens: 2048,
            messages: [{ role: 'user', content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
              { type: 'text', text: prompt }
            ]}]
          })
        });
        const data = await res.json() as { error?: { message?: string }; choices?: Array<{ message?: { content?: string } }> };
        if (!res.ok) throw new Error(data?.error?.message ?? `OpenAI error ${res.status}`);
        const solution = data?.choices?.[0]?.message?.content ?? '';
        return reply.send({ solution, provider: 'openai' });
      } catch (err) {
        console.warn('[solve-screen] OpenAI failed:', (err as Error).message, '— trying Gemini');
      }
    }

    // Fall back to Gemini
    if (env.GEMINI_API_KEY) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [
                { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
                { text: prompt }
              ]}]
            })
          }
        );
        const data = await res.json() as { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        if (!res.ok) throw new Error(data?.error?.message ?? `Gemini error ${res.status}`);
        const solution = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return reply.send({ solution, provider: 'gemini' });
      } catch (err) {
        console.warn('[solve-screen] Gemini failed:', (err as Error).message);
      }
    }

    return reply.code(500).send({ error: 'No vision API available — all providers failed or not configured' });
  });
}
