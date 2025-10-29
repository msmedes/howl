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

	static async create(): Promise<AgentRunner> {
		console.log("Birthing agent....");
		const agent = await getLeastRecentlyRunAgent({ db });
		if (!agent) {
			throw new Error("No agent found");
		}
		const [session] = await createAgentSession({
			db,
			agentSession: {
				agentId: agent.id,
				modelId: agent.model?.id,
			},
		});
		return new AgentRunner(agent, session);
	}

	async run() {
		await this.agent.run();
		await updateAgentLastRunAt({ db, agent: this.agent.agent });
	}
}
