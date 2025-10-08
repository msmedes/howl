import type { Database } from "@howl/db";
import type { Howl, User } from "@howl/db/schema";
import { howlAncestors, howlLikes, howls, users } from "@howl/db/schema";
import { and, desc, eq, isNull, lte, not } from "drizzle-orm";

export const getHowls = async ({
	db,
	limit = 100,
}: {
	includeDeleted?: boolean;
	limit?: number;
	db: Database;
}) => {
	return db.query.howls.findMany({
		where: not(howls.isDeleted),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					agentFriendlyId: true,
				},
			},
			session: {
				with: {
					model: true,
					toolCalls: {
						columns: {
							stepNumber: true,
						},
					},
					thoughts: {
						columns: {
							stepNumber: true,
						},
					},
				},
			},
		},
		limit,
		orderBy: [desc(howls.createdAt)],
	});
};

type CreateHowlParams = {
	content: string;
	userId: string;
	parentId?: string;
	sessionId?: string;
};

export const createHowl = async ({
	db,
	content,
	userId,
	parentId,
	sessionId,
}: CreateHowlParams & { db: Database }) => {
	const [howl] = await db
		.insert(howls)
		.values({
			content,
			userId,
			parentId,
			sessionId,
			isOriginalPost: !parentId, // If no parent, it's an original post
		})
		.returning();
	if (parentId) {
		await populateClosureTable({
			db,
			newHowlId: howl.id,
			parentId,
		});
	} else {
		// For original posts (no parent), just create self-reference
		await db.insert(howlAncestors).values({
			ancestorId: howl.id,
			descendantId: howl.id,
			depth: 0,
		});
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
		.where(and(eq(howlAncestors.ancestorId, rootHowlId), not(howls.isDeleted)))
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
	sessionId,
}: {
	db: Database;
	userId: string;
	howlId: string;
	sessionId?: string;
}) => {
	const like = await db.insert(howlLikes).values({
		userId,
		howlId,
		sessionId,
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

export const getLikedHowlsForUser = async ({
	db,
	userId,
}: {
	db: Database;
	userId: string;
}) => {
	const likedHowls = await db.query.howlLikes.findMany({
		where: eq(howlLikes.userId, userId),
		with: {
			howl: {
				columns: {
					content: true,
					createdAt: true,
					agentFriendlyId: true,
				},
			},
		},
	});
	return likedHowls;
};

export const getHowlsBySession = async ({
	db,
	sessionId,
}: {
	db: Database;
	sessionId: string;
}) => {
	return await db.query.howls.findMany({
		where: eq(howls.sessionId, sessionId),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					agentFriendlyId: true,
				},
			},
			session: {
				with: {
					agent: {
						with: {
							user: true,
							model: true,
						},
					},
				},
			},
		},
		orderBy: [desc(howls.createdAt)],
	});
};

export const getLikesBySession = async ({
	db,
	sessionId,
}: {
	db: Database;
	sessionId: string;
}) => {
	return await db.query.howlLikes.findMany({
		where: eq(howlLikes.sessionId, sessionId),
		with: {
			howl: {
				columns: {
					id: true,
					content: true,
					agentFriendlyId: true,
					createdAt: true,
				},
				with: {
					user: {
						columns: {
							id: true,
							username: true,
						},
					},
				},
			},
			user: {
				columns: {
					id: true,
					username: true,
				},
			},
			session: {
				with: {
					agent: {
						with: {
							user: true,
							model: true,
						},
					},
				},
			},
		},
		orderBy: [desc(howlLikes.createdAt)],
	});
};

export const getHowlWithSessionHistory = async ({
	db,
	howlId,
}: {
	db: Database;
	howlId: string;
}) => {
	const howl = await db.query.howls.findFirst({
		where: eq(howls.id, howlId),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					agentFriendlyId: true,
				},
			},
			session: {
				with: {
					agent: {
						with: {
							user: true,
							model: true,
						},
					},
				},
			},
		},
	});

	if (!howl) {
		return null;
	}

	const likes = await db.query.howlLikes.findMany({
		where: eq(howlLikes.howlId, howlId),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
				},
			},
			session: {
				with: {
					agent: {
						with: {
							user: true,
							model: true,
						},
					},
				},
			},
		},
		orderBy: [desc(howlLikes.createdAt)],
	});

	const replies = await db.query.howls.findMany({
		where: eq(howls.parentId, howlId),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					agentFriendlyId: true,
				},
			},
			session: {
				with: {
					agent: {
						with: {
							user: true,
							model: true,
						},
					},
				},
			},
		},
		orderBy: [desc(howls.createdAt)],
	});

	const sessionIds = new Set<string>();
	if (howl.sessionId) sessionIds.add(howl.sessionId);
	likes.forEach((like) => {
		if (like.sessionId) sessionIds.add(like.sessionId);
	});
	replies.forEach((reply) => {
		if (reply.sessionId) sessionIds.add(reply.sessionId);
	});

	return {
		howl,
		likes,
		replies,
		sessionIds: Array.from(sessionIds),
	};
};
