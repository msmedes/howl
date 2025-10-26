import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
	cleanupTestDatabase,
	createFreshFixtures,
	setupTestDatabase,
} from "../../test/helpers";
import { createUser, followUser, getUserByUsername } from "../users";

describe("Users Tests", () => {
	beforeAll(async () => {
		await setupTestDatabase();
	});

	// Optional cleanup - PGlite will be GC'd automatically
	afterAll(async () => {
		await cleanupTestDatabase();
	});

	it("should be able to create a user", async () => {
		const { db } = await createFreshFixtures();
		const [user] = await createUser({
			db,
			user: {
				username: "newuser",
				email: "newuser@example.com",
				bio: "A new test user",
			},
		});
		expect(user).toBeDefined();
		expect(user.username).toBe("newuser");
		expect(user.email).toBe("newuser@example.com");
	});

	it("should be able to query users by username", async () => {
		const { db, testUser } = await createFreshFixtures();
		const user = await getUserByUsername({ db, username: testUser.username });

		expect(user).toBeDefined();
		expect(user?.username).toBe(testUser.username);
	});

	it("should be able to create a follow relationship", async () => {
		const { db, testUser } = await createFreshFixtures();

		// Create another user to follow
		const [otherUser] = await createUser({
			db,
			user: {
				username: "otheruser",
				email: "other@example.com",
			},
		});

		// Create follow relationship
		const follow = await followUser({
			db,
			followerId: testUser.id,
			followingId: otherUser.id,
		});

		expect(follow).toBeDefined();
	});
});
