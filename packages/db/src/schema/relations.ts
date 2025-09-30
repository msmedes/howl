import { relations } from "drizzle-orm";
import {
	agentDatabaseChanges,
	agentThoughts,
	agentThreads,
	agentToolCalls,
} from "./agents";
import { howlAncestors, howlLikes, howls } from "./howls";
import { follows, userBlocks } from "./social";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
	howls: many(howls),
	blocked: many(userBlocks, { relationName: "blocks" }),
	following: many(follows, { relationName: "following" }),
	followers: many(follows, { relationName: "followers" }),
	agentThreads: many(agentThreads),
}));

export const howlsRelations = relations(howls, ({ one, many }) => ({
	user: one(users, {
		fields: [howls.userId],
		references: [users.id],
	}),
	parent: one(howls, {
		fields: [howls.parentId],
		references: [howls.id],
		relationName: "howl_parent_child",
	}),
	children: many(howls, {
		relationName: "howl_parent_child",
	}),
	ancestors: many(howlAncestors, {
		relationName: "howl_ancestor",
	}),
	descendants: many(howlAncestors, {
		relationName: "howl_descendant",
	}),
}));

export const howlAncestorsRelations = relations(howlAncestors, ({ one }) => ({
	ancestor: one(howls, {
		fields: [howlAncestors.ancestorId],
		references: [howls.id],
		relationName: "howl_ancestor",
	}),
	descendant: one(howls, {
		fields: [howlAncestors.descendantId],
		references: [howls.id],
		relationName: "howl_descendant",
	}),
}));

export const howlLikesRelations = relations(howlLikes, ({ one }) => ({
	user: one(users, {
		fields: [howlLikes.userId],
		references: [users.id],
		relationName: "howl_like_user",
	}),
	howl: one(howls, {
		fields: [howlLikes.howlId],
		references: [howls.id],
		relationName: "howl_like_howl",
	}),
}));

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "followers",
	}),
	following: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "following",
	}),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
	user: one(users, {
		fields: [userBlocks.userId],
		references: [users.id],
		relationName: "blocks",
	}),
	blockedUser: one(users, {
		fields: [userBlocks.blockedUserId],
		references: [users.id],
		relationName: "user_blocked",
	}),
}));

// Agent Thread Relations
export const agentThreadsRelations = relations(
	agentThreads,
	({ one, many }) => ({
		agent: one(users, {
			fields: [agentThreads.agentId],
			references: [users.id],
		}),
		thoughts: many(agentThoughts),
		toolCalls: many(agentToolCalls),
		databaseChanges: many(agentDatabaseChanges),
	}),
);

export const agentThoughtsRelations = relations(agentThoughts, ({ one }) => ({
	thread: one(agentThreads, {
		fields: [agentThoughts.threadId],
		references: [agentThreads.id],
	}),
}));

export const agentToolCallsRelations = relations(agentToolCalls, ({ one }) => ({
	thread: one(agentThreads, {
		fields: [agentToolCalls.threadId],
		references: [agentThreads.id],
	}),
}));

export const agentDatabaseChangesRelations = relations(
	agentDatabaseChanges,
	({ one }) => ({
		thread: one(agentThreads, {
			fields: [agentDatabaseChanges.threadId],
			references: [agentThreads.id],
		}),
	}),
);
