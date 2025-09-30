import {
	index,
	pgTable,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { NANOID_LENGTH } from "../lib/const";
import { users } from "./users";

export const follows = pgTable(
	"follows",
	{
		followerId: varchar({ length: NANOID_LENGTH }).references(() => users.id),
		followingId: varchar({ length: NANOID_LENGTH }).references(() => users.id),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("unique_follow").on(table.followerId, table.followingId),
		index("idx_follows_created_at").on(table.createdAt),
	],
);

export const userBlocks = pgTable(
	"user_blocks",
	{
		userId: varchar({ length: NANOID_LENGTH }).references(() => users.id),
		blockedUserId: varchar({
			length: NANOID_LENGTH,
		}).references(() => users.id),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("unique_user_block").on(table.userId, table.blockedUserId),
		index("idx_user_blocks_user").on(table.userId),
		index("idx_user_blocks_blocked_user").on(table.blockedUserId),
		index("idx_user_blocks_created_at").on(table.createdAt),
	],
);
