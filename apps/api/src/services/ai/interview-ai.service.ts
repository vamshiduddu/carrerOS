import { chatWithFallback } from './multi-model.service';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateInterviewReply(
  sessionTitle: string,
  interviewType: string,
  turns: Turn[]
): Promise<string> {
  const system = `You are an expert interview coach helping a candidate prepare for a ${interviewType} interview for the role: "${sessionTitle}".

Your job is to:
- Ask relevant interview questions one at a time
- Provide constructive, specific feedback on answers
- Suggest improvements using the STAR method where applicable
- Be encouraging but honest
- Keep responses concise (2-4 paragraphs max)

Start by asking the first interview question if the conversation is just beginning.`;

  const messages = [
    { role: 'system' as const, content: system },
    ...turns.map((t) => ({ role: t.role, content: t.content }))
  ];

  const result = await chatWithFallback(messages, { temperature: 0.6, preferredProvider: 'anthropic' });
  return result.text || 'I could not generate a response. Please try again.';
}

export async function generateMockFeedback(
  question: string,
  answer: string,
  interviewType = 'behavioral'
): Promise<{ feedback: string; score: number; idealAnswer: string; strengths: string[]; improvements: string[] }> {
  const system = `You are an expert interview evaluator. Evaluate interview answers objectively and provide structured JSON feedback.`;

  const prompt = `Evaluate this ${interviewType} interview answer:

Question: ${question}
Answer: ${answer}

Respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence overall assessment>",
  "idealAnswer": "<what an ideal answer would include>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

  try {
    const result = await chatWithFallback(
      [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.3, preferredProvider: 'anthropic' }
    );

    // Parse JSON from response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 70,
        feedback: parsed.feedback ?? 'Good answer overall.',
        idealAnswer: parsed.idealAnswer ?? 'A concise STAR answer with measurable impact.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear structure'],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Add specific metrics']
      };
    }
  } catch (err) {
    console.warn('[InterviewAI] Feedback generation failed, using mock:', err);
  }

  // Fallback mock feedback
  return {
    score: 72,
    feedback: 'Solid answer with a clear structure. Consider adding specific metrics to strengthen your impact.',
    idealAnswer: 'A concise STAR answer (Situation, Task, Action, Result) with measurable outcomes.',
    strengths: ['Clear communication', 'Relevant example'],
    improvements: ['Add quantified results', 'Tighten the timeline of events']
  };
}
