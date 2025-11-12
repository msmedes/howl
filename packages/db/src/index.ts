import "dotenv/config";
import * as schema from "@packages/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export interface DatabaseWithClose {
	close(): Promise<void>;
}

export function createDatabase({ databaseUrl }: { databaseUrl: string }) {
	const pool = new Pool({ connectionString: databaseUrl });
	const db = drizzle(pool, {
		schema,
		casing: "snake_case",
	});

	Object.assign(db, {
		close: async () => {
			await pool.end();
		},
	});

	return db as typeof db & DatabaseWithClose;
}

export type Database = ReturnType<typeof createDatabase>;
