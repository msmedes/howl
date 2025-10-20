import type { Database } from "@howl/db";
import type {
	Agent,
	AgentSession,
	InsertAgent,
	InsertAgentSession,
	InsertAgentThought,
	InsertAgentToolCall,
} from "@howl/db/schema";
import {
	agentSessions,
	agents,
	agentThoughts,
	agentToolCalls,
	users,
} from "@howl/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export const getLeastRecentlyRunAgent = async ({ db }: { db: Database }) => {
	const agent = await db.query.agents.findFirst({
		orderBy: [asc(agents.lastRunAt)],
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
	agentThought,
}: {
	db: Database;
	agentThought: InsertAgentThought;
}) => {
	return await db.insert(agentThoughts).values(agentThought).returning();
};

export const createAgentToolCalls = async ({
	db,
	agentToolCall,
}: {
	db: Database;
	agentToolCall: InsertAgentToolCall;
}) => {
	return await db.insert(agentToolCalls).values(agentToolCall).returning();
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

	// Then find the agent by userId
	return await db.query.agents.findFirst({
		where: eq(agents.userId, user.id),
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
				orderBy: [desc(agentSessions.createdAt)],
			},
		},
	});
};
