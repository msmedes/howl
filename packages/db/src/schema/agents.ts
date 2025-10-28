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
import { NANOID_LENGTH } from "../lib/const";
import { users } from "./users";

export const models = pgTable(
	"models",
	{
		id: varchar({ length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		name: varchar({ length: 50 }).notNull(),
		provider: varchar({ length: 50 }).notNull(),
	},
	(table) => [index("idx_models_name").on(table.name)],
);

export const agents = pgTable(
	"agents",
	{
		id: varchar({ length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		userId: varchar({ length: NANOID_LENGTH }).references(() => users.id),
		modelId: varchar({ length: NANOID_LENGTH }).references(() => models.id),
		prompt: text().notNull(),
		promptLength: integer().notNull().default(0),
		promptTokens: integer().notNull().default(0),
		lastRunAt: timestamp(),
	},
	(table) => [
		index("idx_agents_created_at").on(table.createdAt),
		index("idx_agents_updated_at").on(table.updatedAt),
	],
);

export const agentSessions = pgTable(
	"agent_sessions",
	{
		id: varchar({ length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		modelId: varchar({ length: NANOID_LENGTH }).references(() => models.id),
		agentId: varchar({ length: NANOID_LENGTH }).references(() => agents.id),
		rawSessionJson: jsonb(),
		inputTokens: integer().notNull().default(0),
		outputTokens: integer().notNull().default(0),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("idx_agent_sessions_created_at").on(table.createdAt)],
);

export const agentSessionTokenCounts = pgTable(
	"agent_session_token_counts",
	{
		id: varchar({ length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		sessionId: varchar({ length: NANOID_LENGTH })
			.notNull()
			.references(() => agentSessions.id),
		inputTokens: integer().notNull().default(0),
		outputTokens: integer().notNull().default(0),
		stepNumber: integer().notNull(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_agent_session_token_counts_session_id").on(table.sessionId),
	],
);

export const agentThoughts = pgTable(
	"agent_thoughts",
	{
		id: varchar({ length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		sessionId: varchar({ length: NANOID_LENGTH })
			.notNull()
			.references(() => agentSessions.id),
		stepNumber: integer().notNull(),
		content: text().notNull(),
		modelId: varchar({ length: NANOID_LENGTH }).references(() => models.id),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index("idx_agent_thoughts_session").on(table.sessionId),
		index("idx_agent_thoughts_step").on(table.sessionId, table.stepNumber),
		index("idx_agent_thoughts_created_at").on(table.createdAt),
	],
);

export const agentToolCalls = pgTable(
	"agent_tool_calls",
	{
		id: varchar("id", { length: NANOID_LENGTH })
			.primaryKey()
			.$defaultFn(() => nanoid(NANOID_LENGTH)),
		sessionId: varchar({ length: NANOID_LENGTH })
			.notNull()
			.references(() => agentSessions.id),
		stepNumber: integer().notNull(),
		toolName: varchar({ length: 100 }).notNull(),
		arguments: jsonb(),
		modelId: varchar({ length: NANOID_LENGTH }).references(() => models.id),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index("idx_agent_tool_calls_session").on(table.sessionId),
		index("idx_agent_tool_calls_step").on(table.sessionId, table.stepNumber),
		index("idx_agent_tool_calls_name").on(table.toolName),
		index("idx_agent_tool_calls_created_at").on(table.createdAt),
	],
);
