import type { Database } from "@howl/db";
import type { Agent, InsertAgent } from "@howl/db/schema";
import { agents } from "@howl/db/schema";
import { desc, eq } from "drizzle-orm";

export type GetLeastRecentlyRunAgent = Awaited<
	ReturnType<typeof getLeastRecentlyRunAgent>
>;
export const getLeastRecentlyRunAgent = async ({ db }: { db: Database }) => {
	const agent = await db.query.agents.findFirst({
		with: {
			model: {
				columns: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: [desc(agents.lastRunAt)],
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
