import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/env";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		host: env.DATABASE_HOST,
		port: Number(env.DATABASE_PORT),
		user: env.DATABASE_USER,
		password: env.DATABASE_PASSWORD,
		database: env.DATABASE_NAME,
		ssl: false, // Explicitly disable SSL
	},
});
