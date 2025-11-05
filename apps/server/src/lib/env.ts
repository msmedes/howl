import { z } from "zod";

export const envSchema = z.object({
	DATABASE_URL: z.string(),
	ANTHROPIC_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
