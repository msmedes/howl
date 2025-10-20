import { relations } from "drizzle-orm";
import {
	agentSessions,
	agentSessionTokenCounts,
	agents,
	agentThoughts,
	agentToolCalls,
	models,
} from "./agents";
import { howlAncestors, howlLikes, howls } from "./howls";
import { follows, userBlocks } from "./social";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
	howls: many(howls),
	blocked: many(userBlocks, { relationName: "blocks" }),
	following: many(follows, { relationName: "following" }),
	followers: many(follows, { relationName: "followers" }),
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
	session: one(agentSessions, {
		fields: [howls.sessionId],
		references: [agentSessions.id],
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
	session: one(agentSessions, {
		fields: [howlLikes.sessionId],
		references: [agentSessions.id],
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

export const agentsRelations = relations(agents, ({ one, many }) => ({
	user: one(users, {
		fields: [agents.userId],
		references: [users.id],
	}),
	model: one(models, {
		fields: [agents.modelId],
		references: [models.id],
	}),
	sessions: many(agentSessions),
}));

export const agentSessionsRelations = relations(
	agentSessions,
	({ one, many }) => ({
		agent: one(agents, {
			fields: [agentSessions.agentId],
			references: [agents.id],
		}),
		model: one(models, {
			fields: [agentSessions.modelId],
			references: [models.id],
		}),
		thoughts: many(agentThoughts),
		toolCalls: many(agentToolCalls),
		howls: many(howls),
		howlLikes: many(howlLikes),
		tokenCounts: many(agentSessionTokenCounts),
	}),
);

export const agentThoughtsRelations = relations(agentThoughts, ({ one }) => ({
	session: one(agentSessions, {
		fields: [agentThoughts.sessionId],
		references: [agentSessions.id],
	}),
}));

export const agentToolCallsRelations = relations(agentToolCalls, ({ one }) => ({
	session: one(agentSessions, {
		fields: [agentToolCalls.sessionId],
		references: [agentSessions.id],
	}),
}));

export const agentSessionTokenCountsRelations = relations(
	agentSessionTokenCounts,
	({ one }) => ({
		session: one(agentSessions, {
			fields: [agentSessionTokenCounts.sessionId],
			references: [agentSessions.id],
		}),
	}),
);
