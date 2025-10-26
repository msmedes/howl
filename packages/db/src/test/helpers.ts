import { PGlite } from "@electric-sql/pglite";
import * as schema from "@howl/db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "..";
import { createHowl } from "../queries/howls";

// Test database setup
let db: ReturnType<typeof drizzle>;
let pglite: PGlite;

// Test fixtures - these will be available in every test
let testUser: typeof schema.users.$inferSelect;
let testModel: typeof schema.models.$inferSelect;
let testAgent: typeof schema.agents.$inferSelect;
let testHowl: typeof schema.howls.$inferSelect;

// Helper function to clear all tables
async function clearAllTables() {
	// Get all table names from the schema (ordered to respect foreign key constraints)
	const tableNames = [
		"agent_session_token_counts",
		"agent_thoughts",
		"agent_tool_calls",
		"agent_sessions",
		"agents",
		"models",
		"howl_likes",
		"howl_ancestors",
		"howls",
		"user_blocks",
		"follows",
		"users",
	];

	await db.execute(sql`SET session_replication_role = replica;`);

	for (const tableName of tableNames) {
		await db.execute(sql.raw(`DELETE FROM ${tableName}`));
	}
	await db.execute(sql`SET session_replication_role = DEFAULT;`);
}

async function createTestFixtures() {
	const [userResult] = await db
		.insert(schema.users)
		.values({
			username: "testuser",
			email: "test@example.com",
			bio: "Test user for automated testing",
		})
		.returning();
	testUser = userResult;

	// Create a test model
	const [modelResult] = await db
		.insert(schema.models)
		.values({
			name: "test-model",
			provider: "test-provider",
		})
		.returning();
	testModel = modelResult;

	// Create a test agent
	const [agentResult] = await db
		.insert(schema.agents)
		.values({
			userId: testUser.id,
			modelId: testModel.id,
			prompt: "You are a test agent for automated testing.",
		})
		.returning();
	testAgent = agentResult;

	// Create a test howl
	const howlResult = await createHowl({
		db: db as unknown as Database,
		content: "This is a test howl!",
		userId: testUser.id,
	});
	testHowl = howlResult;
}

// Initialize database (call this once per test file)
export async function setupTestDatabase() {
	pglite = new PGlite();
	db = drizzle(pglite, { schema, casing: "snake_case" });

	// Apply migrations
	await migrate(db, { migrationsFolder: "drizzle" });
	console.log("Test database initialized");
	return db;
}

// Clean up database (optional - PGlite will be GC'd automatically)
export async function cleanupTestDatabase() {
	// PGlite is in-memory and will be garbage collected automatically
	// This is just for explicit cleanup if needed
	if (pglite) {
		await pglite.close();
	}
}

// Setup fixtures for each test (call this in beforeEach)
export async function setupTestFixtures() {
	await clearAllTables();
	await createTestFixtures();
}

// Get current fixtures
export function getTestFixtures() {
	return {
		db,
		testUser,
		testModel,
		testAgent,
		testHowl,
	};
}

// Create fresh fixtures for each individual test
export async function createFreshFixtures() {
	await clearAllTables();
	await createTestFixtures();
	return getTestFixtures();
}
