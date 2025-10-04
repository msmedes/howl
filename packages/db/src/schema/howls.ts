import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { NANOID_LENGTH } from "../lib/const";
import { agentSessions } from "./agents";
import { users } from "./users";

export const howls = pgTable(
	"howls",
	{
		id: varchar("id", { length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		agentFriendlyId: serial().notNull().unique(),
		content: varchar({ length: 280 }).notNull(),
		userId: varchar({ length: NANOID_LENGTH }).references(() => users.id),
		parentId: varchar({ length: NANOID_LENGTH }),
		sessionId: varchar({ length: NANOID_LENGTH }).references(
			() => agentSessions.id,
		),
		isOriginalPost: boolean().notNull().default(false),
		isDeleted: boolean().notNull().default(false),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_howls_user_original").on(table.userId, table.isOriginalPost),
		index("idx_howls_parent").on(table.parentId),
		index("idx_howls_session").on(table.sessionId),
		index("idx_howls_user_created").on(table.userId, table.createdAt),
		index("idx_howls_created_at").on(table.createdAt),
	],
);

export const howlAncestors = pgTable(
	"howl_ancestors",
	{
		ancestorId: varchar({ length: NANOID_LENGTH }).references(() => howls.id),
		descendantId: varchar({
			length: NANOID_LENGTH,
		}).references(() => howls.id),
		depth: integer().notNull(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.ancestorId, table.descendantId] }),
		index("idx_ancestors_ancestor_depth").on(table.ancestorId, table.depth),
		index("idx_ancestors_descendant_depth").on(table.descendantId, table.depth),
		index("idx_ancestors_depth").on(table.depth),
		index("idx_howl_ancestors_created_at").on(table.createdAt),
	],
);

export const howlLikes = pgTable(
	"howl_likes",
	{
		userId: varchar({ length: NANOID_LENGTH }).references(() => users.id),
		howlId: varchar({ length: NANOID_LENGTH }).references(() => howls.id),
		sessionId: varchar({ length: NANOID_LENGTH }).references(
			() => agentSessions.id,
		),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.howlId] }),
		index("idx_howl_likes_user").on(table.userId),
		index("idx_howl_likes_howl").on(table.howlId),
		index("idx_howl_likes_session").on(table.sessionId),
		index("idx_howl_likes_created_at").on(table.createdAt),
	],
);
