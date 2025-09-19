import { Anthropic } from "@anthropic-ai/sdk";
import { systemPrompt } from "./lib/prompts";
import { toolMap } from "./lib/tools";
import toolsSchema from "./lib/tools-schema";

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

const currentAgentId = "KbqZBn--bHcby1RKOiNf1";

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

		currentMessages.push({ role: "assistant", content: response.content });

		// Check if the LLM is done (no tool calls)
		const toolCalls = response.content.filter(
			(content) => content.type === "tool_use",
		);

		// Add assistant's response to conversation

		// If no tool calls, the LLM is done
		if (toolCalls.length === 0) {
			console.log("LLM completed - no more tool calls needed");
			break;
		}

		console.log("Tool calls:", toolCalls);

		// Execute tool calls
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
					console.error("Error executing tool call:", error);
					return {
						type: "tool_result",
						tool_use_id: call.id,
						content: JSON.stringify({
							error: error instanceof Error ? error.message : "Unknown error",
						}),
					};
				}
			}),
		);
		console.log("Tool call results:", toolCallResults);

		currentMessages.push({ role: "user", content: toolCallResults });
	}

	console.log(
		`\n--- Conversation completed after ${currentMessages.length - messages.length} exchanges ---`,
	);
	// console.log("Current messages:", currentMessages);
}

main().catch(console.error);
