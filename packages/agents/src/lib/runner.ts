import {
	type GetLeastRecentlyRunAgent,
	getLeastRecentlyRunAgent,
} from "@howl/db/queries/agents";
import Agent from "./agent";

export default class AgentRunner {
	private readonly agent: Agent;

	private constructor(agent: GetLeastRecentlyRunAgent) {
		this.agent = new Agent(agent);
	}

	static async create(): Promise<AgentRunner> {
		const agent = await getLeastRecentlyRunAgent();
		if (!agent) {
			throw new Error("No agent found");
		}
		return new AgentRunner(agent);
	}

	async run() {
		await this.agent.run();
	}
}
