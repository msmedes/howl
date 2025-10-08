import {
	createAgentSession,
	getLeastRecentlyRunAgent,
} from "@howl/db/queries/agents";
import type { AgentSession, AgentWithRelations } from "@howl/db/schema";
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

	private constructor(agent: AgentWithRelations, session: AgentSession) {
		this.agent = new Agent(agent, session);
	}

	static async create(): Promise<AgentRunner> {
		console.log("Birthing agent....");
		const agent = await getLeastRecentlyRunAgent({ db });
		assertAgentExists(agent);
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
	}
}
