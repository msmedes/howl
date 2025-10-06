import type { Database } from "@howl/db";
import type {
	Agent,
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
} from "@howl/db/schema";
import { desc, eq } from "drizzle-orm";

export const getLeastRecentlyRunAgent = async ({ db }: { db: Database }) => {
	const agent = await db.query.agents.findFirst({
		orderBy: [desc(agents.lastRunAt)],
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
