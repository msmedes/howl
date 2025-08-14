import { relations, sql } from "drizzle-orm";
import { pgTable, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
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

export const howlThreads = pgTable("howl_threads", {
  ...ids,
  userId: varchar({ length: 21 }).references(() => users.id),
  ...timestamps,
});

export const howls = pgTable("howls", {
  ...ids,
  content: varchar({ length: 140 }).notNull(),
  userId: varchar({ length: 21 }).references(() => users.id),
  threadId: varchar({ length: 21 }).references(() => howlThreads.id),
  ...timestamps,
});

export const follows = pgTable("follows", {
  followerId: varchar({ length: 21 }).references(() => users.id),
  followingId: varchar({ length: 21 }).references(() => users.id),
  ...timestamps,
}, (table) => [
  uniqueIndex("unique_follow").on(table.followerId, table.followingId),
]);

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
  threads: many(howlThreads),
}));

export const howlThreadsRelations = relations(howlThreads, ({ many, one }) => ({
  howls: many(howls),
  user: one(users, {
    fields: [howlThreads.userId],
    references: [users.id],
  }),
}));

export const howlsRelations = relations(howls, ({ one }) => ({
  user: one(users, {
    fields: [howls.userId],
    references: [users.id],
  }),
  thread: one(howlThreads, {
    fields: [howls.threadId],
    references: [howlThreads.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type HowlThread = typeof howlThreads.$inferSelect;
export type InsertHowlThread = typeof howlThreads.$inferInsert;
export type Howl = typeof howls.$inferSelect;
export type InsertHowl = typeof howls.$inferInsert;
