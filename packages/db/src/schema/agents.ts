import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";

const NANOID_LENGTH = 10;

export const agentThreads = pgTable(
	"agent_threads",
	{
		id: varchar({ length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		agentId: varchar({ length: NANOID_LENGTH })
			.notNull()
			.references(() => users.id),
		sessionId: varchar({ length: NANOID_LENGTH }),
		status: varchar({ length: 50 }).notNull().default("active"),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_agent_threads_agent").on(table.agentId),
		index("idx_agent_threads_session").on(table.sessionId),
		index("idx_agent_threads_status").on(table.status),
		index("idx_agent_threads_created_at").on(table.createdAt),
	],
);

export const agentThoughts = pgTable(
	"agent_thoughts",
	{
		id: varchar({ length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		threadId: varchar({ length: NANOID_LENGTH })
			.notNull()
			.references(() => agentThreads.id),
		stepNumber: integer().notNull(),
		thoughtType: varchar({ length: 50 }).notNull(),
		content: text().notNull(),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index("idx_agent_thoughts_thread").on(table.threadId),
		index("idx_agent_thoughts_step").on(table.threadId, table.stepNumber),
		index("idx_agent_thoughts_type").on(table.thoughtType),
		index("idx_agent_thoughts_created_at").on(table.createdAt),
	],
);

export const agentToolCalls = pgTable(
	"agent_tool_calls",
	{
		id: varchar("id", { length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		threadId: varchar({ length: NANOID_LENGTH })
			.notNull()
			.references(() => agentThreads.id),
		stepNumber: integer().notNull(),
		toolName: varchar({ length: 100 }).notNull(),
		arguments: jsonb(),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index("idx_agent_tool_calls_thread").on(table.threadId),
		index("idx_agent_tool_calls_step").on(table.threadId, table.stepNumber),
		index("idx_agent_tool_calls_name").on(table.toolName),
		index("idx_agent_tool_calls_created_at").on(table.createdAt),
	],
);

export const agentDatabaseChanges = pgTable(
	"agent_database_changes",
	{
		id: varchar("id", { length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		threadId: varchar({ length: NANOID_LENGTH })
			.notNull()
			.references(() => agentThreads.id),
		stepNumber: integer().notNull(),
		operationType: varchar({ length: 20 }).notNull(),
		tableName: varchar({ length: 50 }).notNull(),
		recordId: varchar({ length: NANOID_LENGTH }).notNull(),
		changes: jsonb(),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index("idx_agent_db_changes_thread").on(table.threadId),
		index("idx_agent_db_changes_step").on(table.threadId, table.stepNumber),
		index("idx_agent_db_changes_table").on(table.tableName),
		index("idx_agent_db_changes_record").on(table.tableName, table.recordId),
		index("idx_agent_db_changes_created_at").on(table.createdAt),
	],
);
