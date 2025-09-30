import db from "@howl/db";
import type { Agent } from "@howl/db/schema";
import { agents } from "@howl/db/schema";
import { desc, eq } from "drizzle-orm";

export type GetLeastRecentlyRunAgent = Awaited<
	ReturnType<typeof getLeastRecentlyRunAgent>
>;
export const getLeastRecentlyRunAgent = async () => {
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

export const updateAgentLastRunAt = async (agent: Agent) => {
	await db
		.update(agents)
		.set({ lastRunAt: new Date() })
		.where(eq(agents.id, agent.id));
};
