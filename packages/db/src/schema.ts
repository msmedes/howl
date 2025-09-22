import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	json,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const NANOID_LENGTH = 21;

const timestamps = {
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
};

const ids = {
	id: varchar("id", { length: NANOID_LENGTH })
		.primaryKey()
		.$defaultFn(() => nanoid()),
	agentId: serial("agent_id").notNull().unique(),
};

export const users = pgTable(
	"users",
	{
		...ids,
		username: varchar("username", { length: 255 }).notNull().unique(),
		email: varchar("email", { length: 255 }).notNull().unique(),
		bio: varchar("bio", { length: 255 }),
		...timestamps,
	},
	(table) => [index("idx_created_at").on(table.createdAt)],
);

export const howls = pgTable(
	"howls",
	{
		...ids,
		content: varchar("content", { length: 140 }).notNull(),
		userId: varchar("user_id", { length: NANOID_LENGTH }).references(
			() => users.id,
		),
		parentId: varchar("parent_id", { length: NANOID_LENGTH }).references(
			() => howls.id,
		),
		isOriginalPost: boolean("is_original_post").notNull().default(false),
		isDeleted: boolean("is_deleted").notNull().default(false),
		...timestamps,
	},
	(table) => [
		index("idx_howls_user_original").on(table.userId, table.isOriginalPost),
		index("idx_howls_parent").on(table.parentId),
		index("idx_howls_user_created").on(table.userId, table.createdAt),
		index("idx_created_at").on(table.createdAt),
	],
);

// Closure table for efficient tree queries
export const howlAncestors = pgTable(
	"howl_ancestors",
	{
		ancestorId: varchar("ancestor_id", { length: NANOID_LENGTH }).references(
			() => howls.id,
		),
		descendantId: varchar("descendant_id", {
			length: NANOID_LENGTH,
		}).references(() => howls.id),
		depth: integer("depth").notNull(), // Distance between ancestor and descendant
		...timestamps,
	},
	(table) => [
		primaryKey({ columns: [table.ancestorId, table.descendantId] }),
		index("idx_ancestors_ancestor_depth").on(table.ancestorId, table.depth),
		index("idx_ancestors_descendant_depth").on(table.descendantId, table.depth),
		index("idx_ancestors_depth").on(table.depth),
		index("idx_created_at").on(table.createdAt),
	],
);

export const howlLikes = pgTable(
	"howl_likes",
	{
		userId: varchar("user_id", { length: NANOID_LENGTH }).references(
			() => users.id,
		),
		howlId: varchar({ length: NANOID_LENGTH }).references(() => howls.id),
		...timestamps,
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.howlId] }),
		index("idx_howl_likes_user").on(table.userId),
		index("idx_howl_likes_howl").on(table.howlId),
		index("idx_created_at").on(table.createdAt),
	],
);

export const follows = pgTable(
	"follows",
	{
		followerId: varchar("follower_id", { length: NANOID_LENGTH }).references(
			() => users.id,
		),
		followingId: varchar("following_id", { length: NANOID_LENGTH }).references(
			() => users.id,
		),
		...timestamps,
	},
	(table) => [
		uniqueIndex("unique_follow").on(table.followerId, table.followingId),
		index("idx_created_at").on(table.createdAt),
	],
);

export const userBlocks = pgTable(
	"user_blocks",
	{
		userId: varchar("user_id", { length: NANOID_LENGTH }).references(
			() => users.id,
		),
		blockedUserId: varchar("blocked_user_id", {
			length: NANOID_LENGTH,
		}).references(() => users.id),
		...timestamps,
	},
	(table) => [
		uniqueIndex("unique_user_block").on(table.userId, table.blockedUserId),
		index("idx_user_blocks_user").on(table.userId),
		index("idx_user_blocks_blocked_user").on(table.blockedUserId),
		index("idx_created_at").on(table.createdAt),
	],
);

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
	// Closure table relations
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

// Agent-related tables for tracking thought processes
export const agentSessions = pgTable(
	"agent_sessions",
	{
		...ids,
		agentId: varchar("agent_id", { length: NANOID_LENGTH }).notNull(),
		sessionType: varchar("session_type", { length: 50 })
			.notNull()
			.default("interaction"), // e.g., "interaction", "exploration", "maintenance"
		totalIterations: integer("total_iterations").notNull().default(0),
		metadata: json("metadata"), // Store any additional session metadata
		...timestamps,
	},
	(table) => [
		index("idx_agent_sessions_agent").on(table.agentId),
		index("idx_created_at").on(table.createdAt),
	],
);

export const agentThoughts = pgTable(
	"agent_thoughts",
	{
		...ids,
		sessionId: varchar("session_id", { length: NANOID_LENGTH }).references(
			() => agentSessions.id,
		),
		iterationNumber: integer("iteration_number").notNull(),
		thoughtType: varchar("thought_type", { length: 50 }).notNull(), // "reasoning", "decision", "observation", "planning", "reflection"
		content: text("content").notNull(), // The actual thought content
		context: json("context"), // Additional context about what the agent was thinking about
		confidence: integer("confidence"), // 1-10 scale of how confident the agent was
		...timestamps,
	},
	(table) => [
		index("idx_agent_thoughts_session").on(table.sessionId),
		index("idx_agent_thoughts_iteration").on(
			table.sessionId,
			table.iterationNumber,
		),
		index("idx_agent_thoughts_type").on(table.thoughtType),
		index("idx_created_at").on(table.createdAt),
	],
);

export const agentToolCalls = pgTable(
	"agent_tool_calls",
	{
		...ids,
		sessionId: varchar("session_id", { length: NANOID_LENGTH }).references(
			() => agentSessions.id,
		),
		thoughtId: varchar("thought_id", { length: NANOID_LENGTH }).references(
			() => agentThoughts.id,
		),
		iterationNumber: integer("iteration_number").notNull(),
		toolName: varchar("tool_name", { length: 100 }).notNull(),
		input: json("input").notNull(), // The parameters passed to the tool
		output: json("output"), // The result returned by the tool
		executionTimeMs: integer("execution_time_ms"), // How long the tool took to execute
		success: boolean("success").notNull().default(true),
		errorMessage: text("error_message"), // If the tool call failed
		...timestamps,
	},
	(table) => [
		index("idx_agent_tool_calls_session").on(table.sessionId),
		index("idx_agent_tool_calls_thought").on(table.thoughtId),
		index("idx_agent_tool_calls_iteration").on(
			table.sessionId,
			table.iterationNumber,
		),
		index("idx_agent_tool_calls_tool").on(table.toolName),
		index("idx_created_at").on(table.createdAt),
	],
);

// Agent table relations
export const agentSessionsRelations = relations(agentSessions, ({ many }) => ({
	thoughts: many(agentThoughts),
	toolCalls: many(agentToolCalls),
}));

export const agentThoughtsRelations = relations(
	agentThoughts,
	({ one, many }) => ({
		session: one(agentSessions, {
			fields: [agentThoughts.sessionId],
			references: [agentSessions.id],
		}),
		toolCalls: many(agentToolCalls),
	}),
);

export const agentToolCallsRelations = relations(agentToolCalls, ({ one }) => ({
	session: one(agentSessions, {
		fields: [agentToolCalls.sessionId],
		references: [agentSessions.id],
	}),
	thought: one(agentThoughts, {
		fields: [agentToolCalls.thoughtId],
		references: [agentThoughts.id],
	}),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Howl = typeof howls.$inferSelect;
export type InsertHowl = typeof howls.$inferInsert;
export type HowlAncestor = typeof howlAncestors.$inferSelect;
export type InsertHowlAncestor = typeof howlAncestors.$inferInsert;
export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSession = typeof agentSessions.$inferInsert;
export type AgentThought = typeof agentThoughts.$inferSelect;
export type InsertAgentThought = typeof agentThoughts.$inferInsert;
export type AgentToolCall = typeof agentToolCalls.$inferSelect;
export type InsertAgentToolCall = typeof agentToolCalls.$inferInsert;
