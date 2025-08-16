import { z } from "zod";

export const envSchema = z.object({
	VITE_API_BASE: z.url().default("http://localhost:3001"),
});

export const env = envSchema.parse(import.meta.env);
