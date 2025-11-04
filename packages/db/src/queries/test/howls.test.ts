import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Database } from "@packages/db";
import * as schema from "@packages/db/schema";
import { asc, eq } from "drizzle-orm";
import {
	cleanupTestDatabase,
	createFreshFixtures,
	setupTestDatabase,
} from "../../test/helpers";
import {
	bulkCreateHowlLikes,
	createHowl,
	createHowlLike,
	getHowlsForUser,
	getImmediateReplies,
} from "../howls";

describe("Howls Tests", () => {
	beforeAll(async () => {
		await setupTestDatabase();
	});

	// Optional cleanup - PGlite will be GC'd automatically
	afterAll(async () => {
		await cleanupTestDatabase();
	});

	it("should be able to create a howl", async () => {
		const { db, testUser } = await createFreshFixtures();
		const howl = await createHowl({
			db: db as unknown as Database,
			content: "This is a new test howl!",
			userId: testUser.id,
		});
		expect(howl).toBeDefined();
		expect(howl.content).toBe("This is a new test howl!");
		expect(howl.userId).toBe(testUser.id);
	});

	it("should be able to reply to a howl", async () => {
		const { db, testUser, testHowl } = await createFreshFixtures();
		const reply = await createHowl({
			db: db as unknown as Database,
			content: "This is a reply to the test howl!",
			userId: testUser.id,
			parentId: testHowl.id,
		});
		expect(reply).toBeDefined();
		expect(reply.parentId).toBe(testHowl.id);
		expect(reply.isOriginalPost).toBe(false);
	});

	it("should be able to reply to a howl and correctly populate the closure table", async () => {
		const { db, testUser, testHowl } = await createFreshFixtures();
		const reply = await createHowl({
			db: db as unknown as Database,
			content: "This is a reply to the test howl!",
			userId: testUser.id,
			parentId: testHowl.id,
		});
		expect(reply).toBeDefined();
		expect(reply.parentId).toBe(testHowl.id);
		expect(reply.isOriginalPost).toBe(false);
		const replies = await getImmediateReplies({
			db: db as unknown as Database,
			howlId: testHowl.id,
		});
		expect(replies.length).toBe(1);
		expect(replies[0].id).toBe(reply.id);
		expect(replies[0].parentId).toBe(testHowl.id);
		expect(replies[0].isOriginalPost).toBe(false);

		const howlAncestors = await (
			db as unknown as Database
		).query.howlAncestors.findMany({
			where: eq(schema.howlAncestors.descendantId, reply.id),
			orderBy: [asc(schema.howlAncestors.depth)],
		});

		expect(howlAncestors.length).toBe(2);
		expect(howlAncestors[0].descendantId).toBe(reply.id);
		expect(howlAncestors[0].ancestorId).toBe(reply.id);
		expect(howlAncestors[0].depth).toBe(0);
		expect(howlAncestors[1].descendantId).toBe(reply.id);
		expect(howlAncestors[1].ancestorId).toBe(testHowl.id);
		expect(howlAncestors[1].depth).toBe(1);

		const replyToReply = await createHowl({
			db: db as unknown as Database,
			content: "This is a reply to the reply!",
			userId: testUser.id,
			parentId: reply.id,
		});
		expect(replyToReply).toBeDefined();
		expect(replyToReply.parentId).toBe(reply.id);
		expect(replyToReply.isOriginalPost).toBe(false);

		const replyToReplyAncestors = await (
			db as unknown as Database
		).query.howlAncestors.findMany({
			where: eq(schema.howlAncestors.descendantId, replyToReply.id),
			orderBy: [asc(schema.howlAncestors.depth)],
		});
		expect(replyToReplyAncestors.length).toBe(3);
		expect(replyToReplyAncestors[0].descendantId).toBe(replyToReply.id);
		expect(replyToReplyAncestors[0].ancestorId).toBe(replyToReply.id);
		expect(replyToReplyAncestors[0].depth).toBe(0);
		expect(replyToReplyAncestors[1].descendantId).toBe(replyToReply.id);
		expect(replyToReplyAncestors[1].ancestorId).toBe(reply.id);
		expect(replyToReplyAncestors[1].depth).toBe(1);
		expect(replyToReplyAncestors[2].descendantId).toBe(replyToReply.id);
		expect(replyToReplyAncestors[2].ancestorId).toBe(testHowl.id);
		expect(replyToReplyAncestors[2].depth).toBe(2);

		const immediateReplies = await getImmediateReplies({
			db: db as unknown as Database,
			howlId: testHowl.id,
		});
		expect(immediateReplies.length).toBe(1);
		expect(immediateReplies[0].id).toBe(reply.id);
		expect(immediateReplies[0].parentId).toBe(testHowl.id);
		expect(immediateReplies[0].isOriginalPost).toBe(false);

		const secondReply = await createHowl({
			db: db as unknown as Database,
			content: "This is a second reply!",
			userId: testUser.id,
			parentId: testHowl.id,
		});
		expect(secondReply).toBeDefined();
		expect(secondReply.parentId).toBe(testHowl.id);
		expect(secondReply.isOriginalPost).toBe(false);

		const secondReplyAncestors = await (
			db as unknown as Database
		).query.howlAncestors.findMany({
			where: eq(schema.howlAncestors.descendantId, secondReply.id),
			orderBy: [asc(schema.howlAncestors.depth)],
		});
		expect(secondReplyAncestors.length).toBe(2);
		expect(secondReplyAncestors[0].descendantId).toBe(secondReply.id);
		expect(secondReplyAncestors[0].ancestorId).toBe(secondReply.id);
		expect(secondReplyAncestors[0].depth).toBe(0);
		expect(secondReplyAncestors[1].descendantId).toBe(secondReply.id);
		expect(secondReplyAncestors[1].ancestorId).toBe(testHowl.id);
		expect(secondReplyAncestors[1].depth).toBe(1);
	});

	it("should be able to like a howl", async () => {
		const { db, testUser, testHowl } = await createFreshFixtures();
		const like = await createHowlLike({
			db: db as unknown as Database,
			userId: testUser.id,
			howlId: testHowl.id,
		});
		expect(like).toBeDefined();
	});

	it("should be able to upsert a howl like", async () => {
		const { db, testUser, testHowl } = await createFreshFixtures();
		const _like = await createHowlLike({
			db: db as unknown as Database,
			userId: testUser.id,
			howlId: testHowl.id,
		});

		expect(
			async () =>
				await createHowlLike({
					db: db as unknown as Database,
					userId: testUser.id,
					howlId: testHowl.id,
				}),
		).not.toThrow();
	});

	it("should be able to bulk like howls", async () => {
		const { db, testUser, testHowl } = await createFreshFixtures();
		const howl2 = await createHowl({
			db: db as unknown as Database,
			content: "This is a second howl!",
			userId: testUser.id,
		});
		await createHowlLike({
			db: db as unknown as Database,
			userId: testUser.id,
			howlId: testHowl.id,
		});
		const likes = await bulkCreateHowlLikes({
			db: db as unknown as Database,
			userId: testUser.id,
			howlIds: [testHowl.id, howl2.id],
		});
		expect(likes.length).toBe(1);
		expect(likes[0].userId).toBe(testUser.id);
		expect(likes[0].howlId).toBe(howl2.id);
	});

	it("should be able to query howls by user", async () => {
		const { db, testUser } = await createFreshFixtures();
		const howls = await getHowlsForUser({
			db: db as unknown as Database,
			user: testUser,
		});

		expect(howls.length).toBeGreaterThan(0);
		expect(howls[0].userId).toBe(testUser.id);
	});

	it("should be able to query howls with replies", async () => {
		const { db, testUser, testHowl } = await createFreshFixtures();
		// First create a reply
		await createHowl({
			db: db as unknown as Database,
			content: "This is a reply!",
			userId: testUser.id,
			parentId: testHowl.id,
		});

		// Query for replies to the test howl
		const replies = await getImmediateReplies({
			db: db as unknown as Database,
			howlId: testHowl.id,
		});

		expect(replies.length).toBeGreaterThan(0);
		expect(replies[0].parentId).toBe(testHowl.id);
	});
});
