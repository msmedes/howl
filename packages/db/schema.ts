import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const timestamps = {
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
};

const ids = {
	id: varchar({ length: 21 })
		.primaryKey()
		.$defaultFn(() => nanoid()),
};

export const users = pgTable("users", {
	...ids,
	username: varchar({ length: 255 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
	bio: varchar({ length: 255 }),
	...timestamps,
});

export const howls = pgTable(
	"howls",
	{
		...ids,
		content: varchar({ length: 140 }).notNull(),
		userId: varchar({ length: 21 }).references(() => users.id),
		parentId: varchar({ length: 21 }).references((): any => howls.id), // Self-reference for threading
		isOriginalPost: boolean().notNull().default(false), // Flag for profile filtering
		isDeleted: boolean().notNull().default(false), // Soft delete
		...timestamps,
	},
	(table) => [
		// Index for filtering by user and post type (profile tabs)
		index("idx_howls_user_original").on(table.userId, table.isOriginalPost),
		// Index for finding replies to a specific howl
		index("idx_howls_parent").on(table.parentId),
		// Index for chronological ordering by user
		index("idx_howls_user_created").on(table.userId, table.createdAt),
	],
);

// Closure table for efficient tree queries
export const howlAncestors = pgTable(
	"howl_ancestors",
	{
		ancestorId: varchar({ length: 21 }).references(() => howls.id),
		descendantId: varchar({ length: 21 }).references(() => howls.id),
		depth: integer().notNull(), // Distance between ancestor and descendant
		...timestamps,
	},
	(table) => [
		primaryKey({ columns: [table.ancestorId, table.descendantId] }),
		// Index for finding all descendants of a howl (thread queries)
		index("idx_ancestors_ancestor_depth").on(table.ancestorId, table.depth),
		// Index for finding all ancestors of a howl (reply chain queries)
		index("idx_ancestors_descendant_depth").on(table.descendantId, table.depth),
		// Index for depth-based filtering
		index("idx_ancestors_depth").on(table.depth),
	],
);

export const follows = pgTable(
	"follows",
	{
		followerId: varchar({ length: 21 }).references(() => users.id),
		followingId: varchar({ length: 21 }).references(() => users.id),
		...timestamps,
	},
	(table) => [
		uniqueIndex("unique_follow").on(table.followerId, table.followingId),
	],
);

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
	}),
	following: one(users, {
		fields: [follows.followingId],
		references: [users.id],
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
	howls: many(howls),
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Howl = typeof howls.$inferSelect;
export type InsertHowl = typeof howls.$inferInsert;
export type HowlAncestor = typeof howlAncestors.$inferSelect;
export type InsertHowlAncestor = typeof howlAncestors.$inferInsert;
