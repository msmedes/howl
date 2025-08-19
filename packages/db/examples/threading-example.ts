import { db } from "@howl/db";
import { eq } from "drizzle-orm";
import { howlAncestors, howls, users } from "../schema";

// Example: How to use the new threading system

// 1. Create an original howl (no parent)
export const createOriginalHowl = async (content: string, userId: string) => {
	const howl = await db
		.insert(howls)
		.values({
			content,
			userId,
			isOriginalPost: true,
		})
		.returning();

	// Insert self-reference in closure table (depth 0)
	await db.insert(howlAncestors).values({
		ancestorId: howl[0].id,
		descendantId: howl[0].id,
		depth: 0,
	});

	return howl[0];
};

// 2. Create a reply to an existing howl
export const createReply = async (
	content: string,
	userId: string,
	parentHowlId: string,
) => {
	const howl = await db
		.insert(howls)
		.values({
			content,
			userId,
			parentId: parentHowlId,
			isOriginalPost: false,
		})
		.returning();

	// Populate closure table for the new reply
	await populateClosureTable(howl[0].id, parentHowlId);

	return howl[0];
};

// 3. Get all howls in a thread (including replies)
export const getThread = async (rootHowlId: string) => {
	const thread = await db
		.select({
			howl: howls,
			user: {
				id: users.id,
				username: users.username,
				bio: users.bio,
			},
			depth: howlAncestors.depth,
		})
		.from(howlAncestors)
		.innerJoin(howls, eq(howlAncestors.descendantId, howls.id))
		.innerJoin(users, eq(howls.userId, users.id))
		.where(eq(howlAncestors.ancestorId, rootHowlId))
		.orderBy(howlAncestors.depth, howls.createdAt);

	return thread;
};

// 4. Get only original posts (for user profile "Original Posts" tab)
export const getOriginalPosts = async () => {
	const originalPosts = await db
		.select({
			howl: howls,
			user: {
				id: users.id,
				username: users.username,
				bio: users.bio,
			},
		})
		.from(howls)
		.innerJoin(users, eq(howls.userId, users.id))
		.where(eq(howls.isOriginalPost, true))
		.orderBy(howls.createdAt);

	return originalPosts;
};

// 5. Get only replies (for user profile "Replies" tab)
export const getUserReplies = async (userId: string) => {
	const replies = await db
		.select({
			howl: howls,
			user: {
				id: users.id,
				username: users.username,
				bio: users.bio,
			},
			parentHowl: {
				id: howls.id,
				content: howls.content,
			},
		})
		.from(howls)
		.innerJoin(users, eq(howls.userId, users.id))
		.leftJoin(howls, eq(howls.parentId, howls.id)) // Self-join to get parent
		.where(eq(howls.userId, userId))
		.where(eq(howls.isOriginalPost, false))
		.orderBy(howls.createdAt);

	return replies;
};

// Helper function to populate closure table
const populateClosureTable = async (newHowlId: string, parentId: string) => {
	// Insert self-reference (depth 0)
	await db.insert(howlAncestors).values({
		ancestorId: newHowlId,
		descendantId: newHowlId,
		depth: 0,
	});

	// Get all ancestors of the parent
	const parentAncestors = await db
		.select()
		.from(howlAncestors)
		.where(eq(howlAncestors.descendantId, parentId));

	// Insert relationships to all ancestors
	const closureInserts = parentAncestors.map((ancestor) => ({
		ancestorId: ancestor.ancestorId,
		descendantId: newHowlId,
		depth: ancestor.depth + 1,
	}));

	// Also insert direct parent relationship
	closureInserts.push({
		ancestorId: parentId,
		descendantId: newHowlId,
		depth: 1,
	});

	if (closureInserts.length > 0) {
		await db.insert(howlAncestors).values(closureInserts);
	}
};

// Example usage flow:
/*
1. User creates original howl:
   const originalHowl = await createOriginalHowl("Hello world!", "user123");

2. Another user replies:
   const reply = await createReply("Great post!", "user456", originalHowl.id);

3. View entire thread:
   const thread = await getThread(originalHowl.id);

4. View user's original posts:
   const originalPosts = await getOriginalPosts();

5. View user's replies:
   const replies = await getUserReplies("user456");
*/
