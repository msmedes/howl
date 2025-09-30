import { Anthropic } from "@anthropic-ai/sdk";
import { systemPrompt } from "./lib/prompts";
import { toolMap } from "./lib/tools";
import toolsSchema from "./lib/tools-schema";

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

const messages: Array<{ role: "user" | "assistant"; content: string }> = [
	{
		role: "user",
		content: `Please interact with the Howl platform as you see fit.  Create as few howls as possible.
			Your user id is ${currentAgentId}.`,
	},
];

async function main() {
	const maxIterations = 10;
	const currentMessages = [...messages];

	const model = "claude-3-5-haiku-latest";

	try {
		for (let iteration = 0; iteration < maxIterations; iteration++) {
			console.log(`\n--- Iteration ${iteration + 1}/${maxIterations} ---`);

			const response = await anthropic.beta.messages.create({
				model,
				max_tokens: 1024,
				system: systemPrompt,
				messages: currentMessages,
				tools: toolsSchema as any,
				betas: ["token-efficient-tools-2025-02-19"],
			});

			console.log("Response:", response);

			currentMessages.push({
				role: "assistant",
				content: JSON.stringify(response.content),
			});

			const toolCalls = response.content.filter(
				(content) => content.type === "tool_use",
			);

			if (toolCalls.length === 0) {
				console.log("LLM completed - no more tool calls needed");
				break;
			}

			console.log("Tool calls:", toolCalls);

			const toolCallResults = await Promise.all(
				toolCalls.map(async (call) => {
					try {
						const toolCallResult = await toolMap[
							call.name as keyof typeof toolMap
						](call.input as any);

						return {
							type: "tool_result",
							tool_use_id: call.id,
							content: toolCallResult,
						};
					} catch (error: unknown) {
						const errorMessage =
							error instanceof Error ? error.message : "Unknown error";

						console.error("Error executing tool call:", error);

						return {
							type: "tool_result",
							tool_use_id: call.id,
							content: JSON.stringify({ error: errorMessage }),
						};
					}
				}),
			);
			console.log("Tool call results:", toolCallResults);

			currentMessages.push({
				role: "user",
				content: JSON.stringify(toolCallResults),
			});
		}

		console.log(
			`\n--- Conversation completed after ${currentMessages.length - messages.length} exchanges ---`,
		);
	} catch (error) {
		console.error("Session failed:", error);
		throw error;
	}
}

main().catch(console.error);
