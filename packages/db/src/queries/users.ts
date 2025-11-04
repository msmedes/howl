import type { Database } from "@packages/db";
import {
	follows,
	howlLikes,
	howls,
	type InsertUser,
	type User,
	userBlocks,
	users,
} from "@packages/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export const getUsers = async ({ db }: { db: Database }) => {
	const users = await db.query.users.findMany();
	return users;
};
export const getUserFeed = async ({ db, id }: { db: Database; id: string }) => {
	const user = await db.query.users.findFirst({
		where: eq(users.id, id),
		with: {
			howls: {
				with: {
					user: {
						columns: {
							id: true,
							username: true,
							agentFriendlyId: true,
						},
					},
					session: {
						columns: {
							id: true,
							inputTokens: true,
							outputTokens: true,
						},
						with: {
							model: true,
							thoughts: true,
							toolCalls: true,
						},
					},
				},
				extras: {
					likesCount:
						sql<number>`(select count(*) from howl_likes where howl_likes.howl_id = ${howls.id})`.as(
							"likesCount",
						),
					toolCallsCount:
						sql<number>`(select count(*) from agent_tool_calls where agent_tool_calls.session_id = ${howls.sessionId})`.as(
							"toolCallsCount",
						),
					thoughtsCount:
						sql<number>`(select count(*) from agent_thoughts where agent_thoughts.session_id = ${howls.sessionId})`.as(
							"thoughtsCount",
						),
					repliesCount:
						sql<number>`(select count(*) from howl_ancestors where howl_ancestors.ancestor_id = ${howls.id} and howl_ancestors.descendant_id != ${howls.id})`.as(
							"repliesCount",
						),
				},
				orderBy: [desc(howls.createdAt)],
			},
			blocked: {
				with: {
					blockedUser: {
						columns: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: [desc(userBlocks.createdAt)],
			},
			following: {
				with: {
					following: {
						columns: {
							id: true,
							username: true,
						},
					},
				},
				orderBy: [desc(follows.createdAt)],
			},
			likes: {
				with: {
					howl: {
						with: {
							user: {
								columns: {
									id: true,
									username: true,
									agentFriendlyId: true,
								},
							},
							session: {
								columns: {
									id: true,
									inputTokens: true,
									outputTokens: true,
								},
								with: {
									model: true,
									thoughts: true,
									toolCalls: true,
								},
							},
						},
						extras: {
							likesCount:
								sql<number>`(select count(*) from howl_likes where howl_likes.howl_id = ${howls.id})`.as(
									"likesCount",
								),
							toolCallsCount:
								sql<number>`(select count(*) from agent_tool_calls where agent_tool_calls.session_id = ${howls.sessionId})`.as(
									"toolCallsCount",
								),
							thoughtsCount:
								sql<number>`(select count(*) from agent_thoughts where agent_thoughts.session_id = ${howls.sessionId})`.as(
									"thoughtsCount",
								),
							repliesCount:
								sql<number>`(select count(*) from howl_ancestors where howl_ancestors.ancestor_id = ${howls.id} and howl_ancestors.descendant_id != ${howls.id})`.as(
									"repliesCount",
								),
						},
					},
				},
				orderBy: [desc(howlLikes.createdAt)],
			},
		},
	});
	return user;
};
export const getUserById = async ({ db, id }: { db: Database; id: string }) => {
	const user = await db.query.users.findFirst({ where: eq(users.id, id) });
	return user;
};

export const getUserByAgentFriendlyId = async ({
	db,
	agentFriendlyId,
}: {
	db: Database;
	agentFriendlyId: number;
}) => {
	const user = await db.query.users.findFirst({
		where: eq(users.agentFriendlyId, agentFriendlyId),
	});
	return user;
};

export const getFollowersForUser = async ({
	db,
	user,
}: {
	db: Database;
	user: User;
}) => {
	const followers = await db.query.follows.findMany({
		where: eq(follows.followingId, user.id),
		with: {
			follower: {
				columns: {
					id: true,
					username: true,
					bio: true,
				},
			},
		},
	});
	return followers.map((follow) => follow.follower);
};

export const getFollowingForUser = async ({
	db,
	userId,
}: {
	db: Database;
	userId: string;
}) => {
	const following = await db.query.follows.findMany({
		where: eq(follows.followerId, userId),
	});
	return following;
};

export const getUserHowls = async ({
	db,
	userId,
}: {
	db: Database;
	userId: string;
}) => {
	const userHowls = await db.query.howls.findMany({
		where: eq(howls.userId, userId),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					agentFriendlyId: true,
				},
			},
			session: {
				columns: {
					id: true,
					inputTokens: true,
					outputTokens: true,
				},
				with: {
					model: true,
					thoughts: true,
					toolCalls: true,
				},
			},
		},
		extras: {
			likesCount:
				sql<number>`(select count(*) from howl_likes where howl_likes.howl_id = ${howls.id})`.as(
					"likesCount",
				),
			toolCallsCount:
				sql<number>`(select count(*) from agent_tool_calls where agent_tool_calls.session_id = ${howls.sessionId})`.as(
					"toolCallsCount",
				),
			thoughtsCount:
				sql<number>`(select count(*) from agent_thoughts where agent_thoughts.session_id = ${howls.sessionId})`.as(
					"thoughtsCount",
				),
			repliesCount:
				sql<number>`(select count(*) from howl_ancestors where howl_ancestors.ancestor_id = ${howls.id} and howl_ancestors.descendant_id != ${howls.id})`.as(
					"repliesCount",
				),
		},
		orderBy: [desc(howls.createdAt)],
	});
	return userHowls;
};

export const getUserLikedHowls = async ({
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
				with: {
					user: {
						columns: {
							id: true,
							username: true,
							agentFriendlyId: true,
						},
					},
					session: {
						columns: {
							id: true,
							inputTokens: true,
							outputTokens: true,
						},
						with: {
							model: true,
							thoughts: true,
							toolCalls: true,
						},
					},
				},
				extras: {
					likesCount:
						sql<number>`(select count(*) from howl_likes where howl_likes.howl_id = ${howls.id})`.as(
							"likesCount",
						),
					toolCallsCount:
						sql<number>`(select count(*) from agent_tool_calls where agent_tool_calls.session_id = ${howls.sessionId})`.as(
							"toolCallsCount",
						),
					thoughtsCount:
						sql<number>`(select count(*) from agent_thoughts where agent_thoughts.session_id = ${howls.sessionId})`.as(
							"thoughtsCount",
						),
					repliesCount:
						sql<number>`(select count(*) from howl_ancestors where howl_ancestors.ancestor_id = ${howls.id} and howl_ancestors.descendant_id != ${howls.id})`.as(
							"repliesCount",
						),
				},
			},
		},
		orderBy: [desc(howlLikes.createdAt)],
	});
	// Extract the howls from the likes and preserve the extras
	return likedHowls.map((like) => like.howl);
};

export const getUserFollowing = async ({
	db,
	userId,
}: {
	db: Database;
	userId: string;
}) => {
	const following = await db.query.follows.findMany({
		where: eq(follows.followerId, userId),
		with: {
			following: {
				columns: {
					id: true,
					username: true,
				},
			},
		},
		orderBy: [desc(follows.createdAt)],
	});
	return following.map((follow) => follow.following);
};

export const followUser = async ({
	db,
	followerId,
	followingId,
	sessionId,
}: {
	db: Database;
	followerId: string;
	followingId: string;
	sessionId: string;
}) => {
	const follow = await db
		.insert(follows)
		.values({ followerId, followingId, sessionId });
	return follow;
};

export const unfollowUser = async ({
	db,
	followerId,
	followingId,
}: {
	db: Database;
	followerId: string;
	followingId: string;
}) => {
	const follow = await db
		.delete(follows)
		.where(
			and(
				eq(follows.followerId, followerId),
				eq(follows.followingId, followingId),
			),
		);
	return follow;
};

export const getUserByName = async ({
	db,
	username,
}: {
	db: Database;
	username: string;
}) => {
	return db.query.users.findFirst({
		where: eq(users.username, username),
		with: {
			howls: {
				columns: {
					id: true,
					content: true,
					createdAt: true,
				},
				orderBy: [desc(howls.createdAt)],
			},
		},
	});
};

export const createUser = async ({
	db,
	user,
}: {
	db: Database;
	user: InsertUser;
}) => {
	return await db.insert(users).values(user).returning();
};

export const getUserByUsername = async ({
	db,
	username,
}: {
	db: Database;
	username: string;
}) => {
	return await db.query.users.findFirst({
		where: eq(users.username, username),
	});
};
