import "dotenv/config";
import * as schema from "@howl/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./lib/env";

const db = drizzle(env.DATABASE_URL, {
	schema,
	logger: true,
	casing: "snake_case",
});

export default db;
