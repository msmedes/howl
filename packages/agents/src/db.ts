import { createDatabase } from "@howl/db";

const db = createDatabase({
	databaseUrl: process.env.DATABASE_URL as string,
});

export default db;
