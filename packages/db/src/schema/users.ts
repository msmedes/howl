import {
	index,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { NANOID_LENGTH } from "../lib/const";

export const users = pgTable(
	"users",
	{
		id: varchar("id", { length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		agentFriendlyId: serial().notNull().unique(),
		username: varchar({ length: 255 }).notNull().unique(),
		email: varchar({ length: 255 }).unique(),
		bio: varchar({ length: 255 }),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_users_created_at").on(table.createdAt),
		index("idx_users_username").on(table.username),
	],
);
