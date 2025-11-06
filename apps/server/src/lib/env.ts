import { z } from "zod";

export const envSchema = z.object({
	DATABASE_URL: z.string(),
	ANTHROPIC_API_KEY: z.string(),
	PORT: z.coerce.number().default(3001),
	HOSTNAME: z.string().default("localhost"),
	CORS_ORIGINS: z.preprocess(
		(val) =>
			typeof val === "string"
				? val.split(",").map((origin) => origin.trim())
				: val,
		z.array(z.string()),
	),
});

export const env = envSchema.parse(process.env);
