import {
	createAgentSession,
	getLeastRecentlyRunAgent,
	updateAgentLastRunAt,
} from "@howl/db/queries/agents";
import type { AgentSession, AgentWithRelations } from "@howl/db/schema";
import Agent from "./agent";
import db from "./db";

export default class AgentRunner {
	private readonly agent: Agent;

	private constructor(agent: AgentWithRelations, session: AgentSession) {
		this.agent = new Agent(agent, session);
	}

	static async create(agent?: AgentWithRelations): Promise<AgentRunner> {
		// If no agent provided, get the least recently run one
		const agentToUse = agent ?? (await getLeastRecentlyRunAgent({ db }));
		if (!agentToUse) {
			throw new Error("No agent found");
		}

		const [session] = await createAgentSession({
			db,
			agentSession: {
				agentId: agentToUse.id,
				modelId: agentToUse.model?.id,
			},
		});
		return new AgentRunner(agentToUse, session);
	}

	async run(options?: { onEvent?: (e: any) => void; signal?: AbortSignal }) {
		await this.agent.run(options);
		await updateAgentLastRunAt({ db, agent: this.agent.agent });
	}
}
