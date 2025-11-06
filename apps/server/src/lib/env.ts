import { z } from "zod";

export const envSchema = z.object({
	DATABASE_URL: z.string(),
	ANTHROPIC_API_KEY: z.string(),
	PORT: z.coerce.number().default(3001),
	HOSTNAME: z.string().default("localhost"),
});

export const env = envSchema.parse(process.env);
