import { createDatabase } from "@howl/db";
import { migrate } from "drizzle-orm/pglite/migrator";
import { env } from "./lib/env";

async function applyMigrations() {
	const db = createDatabase({ databaseUrl: env.DATABASE_URL });
	await migrate(db, { migrationsFolder: "drizzle/migrations" });
}

export { applyMigrations };
