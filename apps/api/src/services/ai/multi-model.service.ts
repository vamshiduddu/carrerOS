import { env } from '../../config/env';

type ChatRole = 'system' | 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatInput = {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  messages: ChatMessage[];
};

type ChatResult = {
  text: string;
  usage: unknown;
  provider: string;
  model: string;
};

const openAiLikeDefaults: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  'openai-compatible': 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  groq: 'https://api.groq.com/openai/v1',
  together: 'https://api.together.xyz/v1',
  mistral: 'https://api.mistral.ai/v1',
  azure: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment'
};

function getProviderKey(provider: string): string | undefined {
  const fromEnv: Record<string, string | undefined> = {
    openai: env.OPENAI_API_KEY,
    'openai-compatible': env.OPENAI_API_KEY,
    anthropic: env.ANTHROPIC_API_KEY,
    openrouter: env.OPENROUTER_API_KEY,
    groq: env.GROQ_API_KEY,
    together: env.TOGETHER_API_KEY,
    mistral: env.MISTRAL_API_KEY,
    gemini: env.GEMINI_API_KEY,
    azure: env.AZURE_OPENAI_API_KEY
  };
  return fromEnv[provider];
}

async function callOpenAiCompatible(input: ChatInput): Promise<ChatResult> {
  const apiKey = input.apiKey ?? getProviderKey(input.provider);
  if (!apiKey) throw new Error(`Missing API key for provider: ${input.provider}`);

  const baseUrl = input.baseUrl ?? openAiLikeDefaults[input.provider] ?? openAiLikeDefaults['openai-compatible'];
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: input.model, temperature: input.temperature ?? 0.4, messages: input.messages })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? `Provider request failed (${response.status})`);
  return { text: data?.choices?.[0]?.message?.content ?? '', usage: data?.usage ?? null, provider: input.provider, model: input.model };
}

async function callGemini(input: ChatInput): Promise<ChatResult> {
  const apiKey = input.apiKey ?? getProviderKey('gemini');
  if (!apiKey) throw new Error('Missing API key for provider: gemini');

  const system = input.messages.find((m) => m.role === 'system')?.content;
  const messages = input.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        generationConfig: { temperature: input.temperature ?? 0.4 },
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {})
      })
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? `Gemini request failed (${response.status})`);
  return { text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '', usage: data?.usageMetadata ?? null, provider: 'gemini', model: input.model };
}

async function callAnthropic(input: ChatInput): Promise<ChatResult> {
  const apiKey = input.apiKey ?? getProviderKey('anthropic');
  if (!apiKey) throw new Error('Missing API key for provider: anthropic');

  const system = input.messages.find((m) => m.role === 'system')?.content;
  const messages = input.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: input.model,
      temperature: input.temperature ?? 0.4,
      max_tokens: 1500,
      ...(system ? { system } : {}),
      messages
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? `Anthropic request failed (${response.status})`);

  const text = Array.isArray(data?.content)
    ? data.content.filter((c: { type?: string }) => c.type === 'text').map((c: { text?: string }) => c.text ?? '').join('')
    : '';
  return { text, usage: data?.usage ?? null, provider: 'anthropic', model: input.model };
}

export async function chatWithModel(input: ChatInput): Promise<ChatResult> {
  if (!input.messages.length) throw new Error('messages cannot be empty');

  if (input.provider === 'anthropic') return callAnthropic(input);
  if (input.provider === 'gemini') return callGemini(input);
  return callOpenAiCompatible(input);
}

// Ordered fallback providers — tries each in sequence until one succeeds
const FALLBACK_CHAIN: Array<{ provider: string; model: string; keyEnv: () => string | undefined }> = [
  { provider: 'anthropic', model: 'claude-haiku-4-5-20251001', keyEnv: () => env.ANTHROPIC_API_KEY },
  { provider: 'openai', model: 'gpt-4o-mini', keyEnv: () => env.OPENAI_API_KEY },
  { provider: 'groq', model: 'llama-3.3-70b-versatile', keyEnv: () => env.GROQ_API_KEY },
  { provider: 'openrouter', model: 'openai/gpt-4o-mini', keyEnv: () => env.OPENROUTER_API_KEY },
  { provider: 'together', model: 'meta-llama/Llama-3-8b-chat-hf', keyEnv: () => env.TOGETHER_API_KEY },
  { provider: 'mistral', model: 'mistral-small-latest', keyEnv: () => env.MISTRAL_API_KEY },
  { provider: 'gemini', model: 'gemini-1.5-flash', keyEnv: () => env.GEMINI_API_KEY }
];

export async function chatWithFallback(
  messages: ChatMessage[],
  options?: { temperature?: number; preferredProvider?: string }
): Promise<ChatResult> {
  const chain = options?.preferredProvider
    ? [
        ...FALLBACK_CHAIN.filter((p) => p.provider === options.preferredProvider),
        ...FALLBACK_CHAIN.filter((p) => p.provider !== options.preferredProvider)
      ]
    : FALLBACK_CHAIN;

  const available = chain.filter((p) => p.keyEnv());

  if (available.length === 0) {
    // No API keys configured — return a deterministic mock
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    return {
      text: `[AI unavailable — no API keys configured] Echo: ${lastUser.slice(0, 120)}`,
      usage: null,
      provider: 'mock',
      model: 'none'
    };
  }

  let lastError: Error | null = null;
  for (const candidate of available) {
    try {
      const result = await chatWithModel({ provider: candidate.provider, model: candidate.model, messages, temperature: options?.temperature ?? 0.5 });
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI] Provider ${candidate.provider} failed: ${lastError.message} — trying next`);
    }
  }

  throw lastError ?? new Error('All AI providers failed');
}

export function listModelProviders() {
  return [
    { provider: 'openai', supportsCustomBaseUrl: false, models: ['gpt-4o', 'gpt-4.1-mini', 'gpt-4o-mini'] },
    { provider: 'anthropic', supportsCustomBaseUrl: false, models: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'] },
    { provider: 'gemini', supportsCustomBaseUrl: false, models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
    { provider: 'azure', supportsCustomBaseUrl: true, models: ['gpt-4o', 'gpt-4o-mini'] },
    { provider: 'openrouter', supportsCustomBaseUrl: false, models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet'] },
    { provider: 'groq', supportsCustomBaseUrl: false, models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
    { provider: 'openai-compatible', supportsCustomBaseUrl: true, models: ['any-compatible-model'] }
  ];
}
