import { createDatabase } from "@howl/db";

export default createDatabase({
	databaseUrl: process.env.DATABASE_URL as string,
});
