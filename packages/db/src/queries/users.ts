import db from "@howl/db";
import { follows, howls, type User, userBlocks, users } from "@howl/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const getUsers = async () => {
	const users = await db.query.users.findMany();
	return users;
};
export const getUserFeed = async (id: string) => {
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
export const getUserById = async (id: string) => {
	const user = await db.query.users.findFirst({ where: eq(users.id, id) });
	return user;
};

export const getFollowersForUser = async (user: User) => {
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

export const getFollowingForUser = async (userId: string) => {
	const following = await db.query.follows.findMany({
		where: eq(follows.followerId, userId),
	});
	return following;
};

export const followUser = async (followerId: string, followingId: string) => {
	const follow = await db.insert(follows).values({ followerId, followingId });
	return follow;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
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

export const getUserByName = async (username: string) => {
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
