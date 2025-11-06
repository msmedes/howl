import "dotenv/config";
import { createDatabase } from "@packages/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { env } from "@/src/lib/env";

async function runMigrations() {
	console.log("Starting database migrations...");
	console.log(
		`Database URL: ${env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`,
	); // Hide password in logs

	try {
		const db = createDatabase({ databaseUrl: env.DATABASE_URL });

		// Run migrations
		// migrationsFolder is relative to current working directory (apps/server)
		// Need to go up to monorepo root, then into packages/db/drizzle
		// @ts-expect-error - Type incompatibility between extended db type and migrate's expected type
		// This is safe at runtime as the underlying database instance is compatible
		await migrate(db, {
			migrationsFolder: "../../packages/db/drizzle",
		});

		console.log("Migrations completed successfully");

		// Close the database connection
		await db.close();
		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	}
}

runMigrations();
