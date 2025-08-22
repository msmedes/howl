import { z } from "zod";

export const envSchema = z.object({
	DATABASE_HOST: z.string().default("localhost"),
	DATABASE_PORT: z.coerce.number().default(5432),
	DATABASE_USER: z.string().default("postgres"),
	DATABASE_PASSWORD: z.string().default("postgres"),
	DATABASE_NAME: z.string().default("postgres"),
	DATABASE_URL: z
		.string()
		.default("postgresql://postgres:mypassword@localhost:5433/postgres"),
});

export const env = envSchema.parse(process.env);
