import { db } from "@howl/db";
import { and, eq, isNull, lte } from "drizzle-orm";
import { howlAncestors, howls, type User, users } from "../schema";

export const getHowls = async () => {
	const howls = await db.query.howls.findMany({
		with: {
			user: {
				columns: {
					id: true,
				},
			},
		},
	});
	return howls;
};

export const createHowl = async (
	content: string,
	userId: string,
	parentId?: string,
) => {
	const howl = await db
		.insert(howls)
		.values({
			content,
			userId,
			parentId,
			isOriginalPost: !parentId, // If no parent, it's an original post
		})
		.returning();

	// If this is a reply, we need to populate the closure table
	if (parentId) {
		await populateClosureTable(howl[0].id, parentId);
	}

	return howl;
};

export const getHowlsForUser = async (user: User) => {
	const howlsForUser = await db.query.howls.findMany({
		where: eq(howls.userId, user.id),
	});
	return howlsForUser;
};

export const getHowlById = async (id: string) => {
	const howl = await db.query.howls.findFirst({
		where: eq(howls.id, id),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					bio: true,
				},
			},
		},
	});
	return howl;
};

// Get original posts only (no parent)
export const getOriginalPosts = async () => {
	const originalPosts = await db.query.howls.findMany({
		where: eq(howls.isOriginalPost, true),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					bio: true,
				},
			},
		},
	});
	return originalPosts;
};

// Get replies only (has parent)
export const getReplies = async () => {
	const replies = await db.query.howls.findMany({
		where: isNull(howls.parentId),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					bio: true,
				},
			},
		},
	});
	return replies;
};

// Get immediate replies to a specific howl
export const getImmediateReplies = async (howlId: string) => {
	const replies = await db.query.howls.findMany({
		where: eq(howls.parentId, howlId),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					bio: true,
				},
			},
		},
		orderBy: [howls.createdAt],
	});
	return replies;
};

// Get entire thread using closure table
export const getFullThread = async (rootHowlId: string) => {
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

// Get all descendants up to a certain depth
export const getDescendantsUpToDepth = async (
	howlId: string,
	maxDepth: number,
) => {
	const descendants = await db
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
		.where(
			and(
				eq(howlAncestors.ancestorId, howlId),
				lte(howlAncestors.depth, maxDepth),
			),
		)
		.orderBy(howlAncestors.depth, howls.createdAt);

	return descendants;
};

// Helper function to populate closure table when adding replies
const populateClosureTable = async (newHowlId: string, parentId: string) => {
	// Insert self-reference (depth 0)
	await db.insert(howlAncestors).values({
		ancestorId: newHowlId,
		descendantId: newHowlId,
		depth: 0,
	});

	// Get all ancestors of the parent
	const parentAncestors = await db.query.howlAncestors.findMany({
		where: eq(howlAncestors.descendantId, parentId),
	});

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
