import "dotenv/config";
import * as schema from "@howl/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./lib/env";

// biome-ignore lint/style/noNonNullAssertion: it's fine
const db = drizzle(env.DATABASE_URL, { schema });

export default db;
