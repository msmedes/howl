import type { Database } from "@howl/db";
import {
	follows,
	howls,
	type InsertUser,
	type User,
	userBlocks,
	users,
} from "@howl/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const getUsers = async ({ db }: { db: Database }) => {
	const users = await db.query.users.findMany();
	return users;
};
export const getUserFeed = async ({ db, id }: { db: Database; id: string }) => {
	const user = await db.query.users.findFirst({
		where: eq(users.id, id),
		with: {
			howls: {
				columns: {
					id: true,
					content: true,
					createdAt: true,
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

export const followUser = async ({
	db,
	followerId,
	followingId,
}: {
	db: Database;
	followerId: string;
	followingId: string;
}) => {
	const follow = await db.insert(follows).values({ followerId, followingId });
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
