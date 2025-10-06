import AgentRunner from "@/runner";

async function main() {
	const agent = await AgentRunner.create();
	await agent.run();
}

main().catch(console.error);
