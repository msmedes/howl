import type { Database } from "@howl/db";
import {
	agentSessions,
	agentSessionTokenCounts,
	agentThoughts,
	agentToolCalls,
	howls,
	type InsertAgentSessionTokenCount,
} from "@howl/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";

export const getAgentSessionById = async ({
	db,
	id,
}: {
	db: Database;
	id: string;
}) => {
	return db.query.agentSessions.findFirst({
		where: eq(agentSessions.id, id),
		columns: {
			id: true,
			createdAt: true,
			rawSessionJson: true,
		},
		with: {
			thoughts: {
				columns: {
					stepNumber: true,
					content: true,
				},
				orderBy: [asc(agentThoughts.stepNumber)],
			},
			toolCalls: {
				columns: {
					stepNumber: true,
					toolName: true,
					arguments: true,
				},
				orderBy: [asc(agentToolCalls.stepNumber)],
			},
			howls: {
				columns: {
					id: true,
					createdAt: true,
					content: true,
				},
				orderBy: [desc(howls.createdAt)],
			},
			tokenCounts: {
				columns: {
					stepNumber: true,
					inputTokens: true,
					outputTokens: true,
				},
				orderBy: [asc(agentSessionTokenCounts.stepNumber)],
			},
			model: true,
		},
	});
};

export const createAgentSessionTokenCount = async ({
	db,
	agentSessionTokenCount,
}: {
	db: Database;
	agentSessionTokenCount: InsertAgentSessionTokenCount;
}) => {
	return db
		.insert(agentSessionTokenCounts)
		.values(agentSessionTokenCount)
		.returning();
};

export const getAgentSessions = async ({ db }: { db: Database }) => {
	return db.query.agentSessions.findMany({
		orderBy: [desc(agentSessions.createdAt)],
		with: {
			model: {
				columns: {
					id: true,
					name: true,
				},
			},
			agent: {
				columns: {
					id: true,
				},
				with: {
					user: {
						columns: {
							id: true,
							username: true,
						},
					},
				},
			},
		},
		extras: {
			toolCallsCount:
				sql<number>`(select count(*) from agent_tool_calls where agent_tool_calls.session_id = ${agentSessions.id})`.as(
					"toolCallsCount",
				),
			thoughtsCount:
				sql<number>`(select count(*) from agent_thoughts where agent_thoughts.session_id = ${agentSessions.id})`.as(
					"thoughtsCount",
				),
			howlsCount:
				sql<number>`(select count(*) from howls where howls.session_id = ${agentSessions.id})`.as(
					"howlsCount",
				),
		},
	});
};
