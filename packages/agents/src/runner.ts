import { getLeastRecentlyRunAgent } from "@howl/db/queries/agents";
import type { AgentWithRelations } from "@howl/db/schema";
import Agent from "./agent";
import db from "./db";

function assertAgentExists(
	agent: Awaited<ReturnType<typeof getLeastRecentlyRunAgent>>,
): asserts agent is AgentWithRelations {
	if (!agent) {
		throw new Error("No agent found");
	}
}

export default class AgentRunner {
	private readonly agent: Agent;

	private constructor(agent: AgentWithRelations) {
		this.agent = new Agent(agent);
	}

	static async create(): Promise<AgentRunner> {
		console.log("Birthing agent....");
		const agent = await getLeastRecentlyRunAgent({ db });
		assertAgentExists(agent);
		return new AgentRunner(agent);
	}

	async run() {
		await this.agent.run();
	}
}
