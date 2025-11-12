import { createDatabase } from "@packages/db";
import { env } from "@/src/lib/env";

export const db = createDatabase({
	databaseUrl: env.DATABASE_URL,
});
