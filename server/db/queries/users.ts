import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, follows } from "@/db/schema";

export const getUserById = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return user;
};

export const getFollowersForUser = async (userId: string) => {
  const followers = await db.query.follows.findMany({
    where: eq(follows.followingId, userId),
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
  const follow = await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  return follow;
};