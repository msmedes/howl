import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@howl/db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

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

	// Disable foreign key checks temporarily
	await db.execute(sql`SET session_replication_role = replica;`);

	// Clear all tables
	for (const tableName of tableNames) {
		await db.execute(sql.raw(`DELETE FROM ${tableName}`));
	}

	// Re-enable foreign key checks
	await db.execute(sql`SET session_replication_role = DEFAULT;`);
}

// Helper function to create test fixtures
async function createTestFixtures() {
	// Create a test user
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
	const [howlResult] = await db
		.insert(schema.howls)
		.values({
			content: "This is a test howl!",
			userId: testUser.id,
		})
		.returning();
	testHowl = howlResult;
}

beforeAll(async () => {
	// Create an in-memory PGlite database for testing
	pglite = new PGlite();
	db = drizzle(pglite, { schema, casing: "snake_case" });

	// You can add schema setup here when ready to test actual queries
	console.log("Test database initialized");
	await migrate(db, { migrationsFolder: "drizzle" });
	console.log("Migrations applied");
	console.log("Database initialized");
});

afterAll(async () => {
	// Clean up the test database
	try {
		if (pglite) {
			await pglite.close();
		}
		console.log("Test database closed");
	} catch (_error) {
		// Ignore cleanup errors in test environment
		console.log("Test database cleanup completed");
	}
});

afterEach(async () => {
	await clearAllTables();
});

beforeEach(async () => {
	await createTestFixtures();
});

describe("Database Test Setup", () => {
	it("should have a working database connection", async () => {
		// Test basic database connectivity
		const result = await db.execute("SELECT 1 as test");
		expect(result.rows[0]).toEqual({ test: 1 });
	});
});

describe("Database Test Insertions", () => {
	it("should be able to insert a user", async () => {
		const _result = await db.insert(schema.users).values({
			username: "test",
			email: "test@test.com",
		});
	});

	it("should be able to insert a howl", async () => {
		// Use the testUser fixture that was created in beforeEach
		const _result = await db.insert(schema.howls).values({
			content: "This is a test howl using fixtures!",
			userId: testUser.id,
		});
		expect(_result).toBeDefined();
	});

	it("should be able to create an agent session", async () => {
		// Use the testAgent fixture
		const _result = await db.insert(schema.agentSessions).values({
			agentId: testAgent.id,
			modelId: testModel.id,
			inputTokens: 100,
			outputTokens: 50,
		});
		expect(_result).toBeDefined();
	});

	it("should be able to reply to a howl", async () => {
		const _result = await db.insert(schema.howls).values({
			content: "This is a test reply to a howl!",
			userId: testUser.id,
			parentId: testHowl.id,
		});
		expect(_result).toBeDefined();
	});
});
