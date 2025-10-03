import "dotenv/config";
import * as schema from "@howl/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";

export function createDatabase({ databaseUrl }: { databaseUrl: string }) {
	return drizzle(databaseUrl, {
		schema,
		logger: true,
		casing: "snake_case",
	});
}

export type Database = ReturnType<typeof createDatabase>;
