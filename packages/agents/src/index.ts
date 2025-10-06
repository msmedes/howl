import db from "@/db";
import AgentRunner from "@/runner";

async function main() {
	const agent = await AgentRunner.create();
	await agent.run();

	// Close the database connection to prevent hanging
	await db.close();
}

main().catch(console.error);
