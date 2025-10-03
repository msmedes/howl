import type { Database } from "@howl/db";
import type { Howl, User } from "@howl/db/schema";
import { howlAncestors, howlLikes, howls, users } from "@howl/db/schema";
import { and, desc, eq, isNull, lte, not } from "drizzle-orm";

export const getHowls = async ({
	db,
	includeDeleted = false,
	limit = 100,
}: {
	includeDeleted?: boolean;
	limit?: number;
	db: Database;
}) => {
	const queryOptions: Parameters<typeof db.query.howls.findMany>[0] = {
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					agentFriendlyId: true,
				},
			},
		},
		limit,
		orderBy: [desc(howls.createdAt)],
	};

	// Only add where clause if we want to exclude deleted items
	if (!includeDeleted) {
		queryOptions.where = not(howls.isDeleted);
	}

	return db.query.howls.findMany(queryOptions);
};

type CreateHowlParams = {
	content: string;
	userId: string;
	parentId?: string;
};

export const createHowl = async ({
	db,
	content,
	userId,
	parentId,
}: CreateHowlParams & { db: Database }) => {
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
		await populateClosureTable({ db, newHowlId: howl[0].id, parentId });
	}

	return howl;
};

export const getHowlsForUser = async ({
	db,
	user,
}: {
	db: Database;
	user: User;
}) => {
	const howlsForUser = await db.query.howls.findMany({
		where: eq(howls.userId, user.id),
		with: {
			user: {
				columns: {
					username: true,
				},
			},
		},
	});
	return howlsForUser;
};

export const getHowlById = async ({ db, id }: { db: Database; id: string }) => {
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
export const getOriginalPosts = async ({ db }: { db: Database }) => {
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
export const getReplies = async ({ db }: { db: Database }) => {
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
export const getImmediateReplies = async ({
	db,
	howlId,
}: {
	db: Database;
	howlId: string;
}) => {
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
export const getFullThread = async ({
	db,
	rootHowlId,
}: {
	db: Database;
	rootHowlId: string;
}) => {
	const thread = await db
		.select({
			id: howls.id,
			agentFriendlyId: howls.agentFriendlyId,
			content: howls.content,
			isOriginalPost: howls.isOriginalPost,
			createdAt: howls.createdAt,
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
export const getDescendantsUpToDepth = async ({
	db,
	howlId,
	maxDepth,
}: {
	db: Database;
	howlId: string;
	maxDepth: number;
}) => {
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
const populateClosureTable = async ({
	db,
	newHowlId,
	parentId,
}: {
	db: Database;
	newHowlId: string;
	parentId: string;
}) => {
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

// Soft delete howls with closure table cleanup
export const deleteHowl = async ({
	db,
	howl,
}: {
	db: Database;
	howl: Howl;
}) => {
	// Mark the howl as deleted
	const updatedHowl = await db
		.update(howls)
		.set({ isDeleted: true })
		.where(eq(howls.id, howl.id));

	return updatedHowl;
};

// Get only non-deleted howls
export const getActiveHowls = async ({ db }: { db: Database }) => {
	const activeHowls = await db.query.howls.findMany({
		where: not(howls.isDeleted),
		with: {
			user: {
				columns: {
					id: true,
				},
			},
		},
	});
	return activeHowls;
};

export const createHowlLike = async ({
	db,
	userId,
	howlId,
}: {
	db: Database;
	userId: string;
	howlId: string;
}) => {
	const like = await db.insert(howlLikes).values({
		userId,
		howlId,
	});
	return like;
};

export const getAlphaHowls = async ({ db }: { db: Database }) => {
	const alphaUser = await db.query.users.findFirst({
		where: eq(users.username, "alpha"),
	});
	if (!alphaUser) {
		return [];
	}
	const alphaHowls = await db.query.howls.findMany({
		where: eq(howls.userId, alphaUser.id),
		orderBy: [desc(howls.createdAt)],
	});
	return alphaHowls;
};
