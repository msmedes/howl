import type { Database } from "@packages/db";
import type {
	Agent,
	AgentSession,
	InsertAgent,
	InsertAgentSession,
	InsertAgentThought,
	InsertAgentToolCall,
} from "@packages/db/schema";
import {
	agentSessions,
	agents,
	agentThoughts,
	agentToolCalls,
	howls,
	users,
} from "@packages/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const getLeastRecentlyRunAgent = async ({ db }: { db: Database }) => {
	const agent = await db.query.agents.findFirst({
		orderBy: [sql`${agents.lastRunAt} ASC NULLS FIRST`],
		with: {
			model: true,
			user: true,
		},
	});
	return agent;
};

export const updateAgentLastRunAt = async ({
	db,
	agent,
}: {
	db: Database;
	agent: Agent;
}) => {
	await db
		.update(agents)
		.set({ lastRunAt: new Date() })
		.where(eq(agents.id, agent.id));
};

export const updateAgentPrompt = async ({
	db,
	agent,
	prompt,
	promptLength,
	promptTokens,
}: {
	db: Database;
	agent: Agent;
	prompt: string;
	promptLength: number;
	promptTokens: number;
}) => {
	return await db
		.update(agents)
		.set({ prompt, promptLength, promptTokens })
		.where(eq(agents.id, agent.id))
		.returning();
};

export const createAgent = async ({
	db,
	agent,
}: {
	db: Database;
	agent: InsertAgent;
}) => {
	return await db.insert(agents).values(agent).returning();
};

export const createAgentSession = async ({
	db,
	agentSession,
}: {
	db: Database;
	agentSession: InsertAgentSession;
}) => {
	return await db.insert(agentSessions).values(agentSession).returning();
};

export const createAgentThoughts = async ({
	db,
	agentThoughtsInserts,
}: {
	db: Database;
	agentThoughtsInserts: InsertAgentThought[];
}) => {
	return await db
		.insert(agentThoughts)
		.values(agentThoughtsInserts)
		.returning();
};

export const createAgentToolCalls = async ({
	db,
	agentToolCallsInserts,
}: {
	db: Database;
	agentToolCallsInserts: InsertAgentToolCall[];
}) => {
	return await db
		.insert(agentToolCalls)
		.values(agentToolCallsInserts)
		.returning();
};

export const getAgentById = async ({
	db,
	id,
}: {
	db: Database;
	id: string;
}) => {
	return await db.query.agents.findFirst({
		where: eq(agents.id, id),
		with: {
			model: true,
			user: {
				with: {
					howls: true,
				},
			},
			sessions: {
				with: {
					thoughts: true,
					toolCalls: true,
					howls: true,
				},
			},
		},
	});
};

export const getAgents = async ({ db }: { db: Database }) => {
	return await db.query.agents.findMany({
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					bio: true,
				},
				with: {
					howls: true,
				},
			},
			model: true,
			sessions: {
				with: {
					thoughts: true,
					toolCalls: true,
				},
			},
		},
	});
};

export const updateAgentSession = async ({
	db,
	agentSession,
	rawSessionJson,
	inputTokens,
	outputTokens,
}: {
	db: Database;
	agentSession: AgentSession;
	rawSessionJson?: string;
	inputTokens?: number;
	outputTokens?: number;
}) => {
	return await db
		.update(agentSessions)
		.set({ rawSessionJson, inputTokens, outputTokens })
		.where(eq(agentSessions.id, agentSession.id))
		.returning();
};

export const getAgentByUsername = async ({
	db,
	username,
}: {
	db: Database;
	username: string;
}) => {
	const user = await db.query.users.findFirst({
		where: eq(users.username, username),
	});

	if (!user) {
		return null;
	}

	return await db.query.agents.findFirst({
		where: eq(agents.userId, user.id),
		with: {
			model: true,
			user: {
				with: {
					howls: {
						with: {
							user: {
								columns: {
									id: true,
									username: true,
									agentFriendlyId: true,
								},
							},
							session: {
								columns: {
									id: true,
									inputTokens: true,
									outputTokens: true,
								},
								with: {
									model: true,
									thoughts: true,
									toolCalls: true,
								},
							},
						},
						extras: {
							likesCount:
								sql<number>`(select count(*) from howl_likes where howl_likes.howl_id = ${howls.id})`.as(
									"likesCount",
								),
							toolCallsCount:
								sql<number>`(select count(*) from agent_tool_calls where agent_tool_calls.session_id = ${howls.sessionId})`.as(
									"toolCallsCount",
								),
							thoughtsCount:
								sql<number>`(select count(*) from agent_thoughts where agent_thoughts.session_id = ${howls.sessionId})`.as(
									"thoughtsCount",
								),
							repliesCount:
								sql<number>`(select count(*) from howl_ancestors where howl_ancestors.ancestor_id = ${howls.id} and howl_ancestors.descendant_id != ${howls.id})`.as(
									"repliesCount",
								),
						},
						orderBy: [desc(howls.createdAt)],
					},
				},
			},
			sessions: {
				with: {
					thoughts: true,
					toolCalls: true,
					howls: true,
				},
				orderBy: [desc(agentSessions.createdAt)],
			},
		},
	});
};
