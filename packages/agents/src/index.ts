class Agent {
	constructor(private readonly agent: Agent) {
		this.agent = agent;
	}

	async run() {
		await this.agent.run();
	}
}
