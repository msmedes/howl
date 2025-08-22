import db from "@howl/db";
import { migrate } from "drizzle-orm/pglite/migrator";

async function applyMigrations() {
	await migrate(db, { migrationsFolder: "drizzle/migrations" });
}

export { applyMigrations };
