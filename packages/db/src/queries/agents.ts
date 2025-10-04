import type { Database } from "@howl/db";
import type { Agent, InsertAgent } from "@howl/db/schema";
import { agents } from "@howl/db/schema";
import { desc, eq } from "drizzle-orm";

export type GetLeastRecentlyRunAgent = Awaited<
	ReturnType<typeof getLeastRecentlyRunAgent>
>;
export const getLeastRecentlyRunAgent = async ({ db }: { db: Database }) => {
	console.log("getting least recently run agent....");
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

// we need a few queries to create an agent session
// when an agent session is started we need to keep track of a few things:
// the step
// any howls, likes, or replies created by the agent during this session
// the chain of thought
// the tool calls
// the raw session thread
