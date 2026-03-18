import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(3001),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	CORS_ORIGIN: z.string().default('*'),
	JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me'),
	JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me'),
	JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
	JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
	OPENAI_API_KEY: z.string().optional(),
	ANTHROPIC_API_KEY: z.string().optional(),
	OPENROUTER_API_KEY: z.string().optional(),
	GROQ_API_KEY: z.string().optional(),
	TOGETHER_API_KEY: z.string().optional(),
	MISTRAL_API_KEY: z.string().optional(),
	GEMINI_API_KEY: z.string().optional(),
	AZURE_OPENAI_API_KEY: z.string().optional(),
	RESEND_API_KEY: z.string().optional(),
	RESEND_FROM: z.string().optional()
});

export const env = envSchema.parse(process.env);

export type AppEnv = typeof env;

