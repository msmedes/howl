import { Anthropic } from "@anthropic-ai/sdk";
import { systemPrompt } from "./lib/prompts";
import { ThoughtLogger } from "./lib/thought-logger";
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
	const thoughtLogger = new ThoughtLogger(currentAgentId);

	// Start a new thought session
	await thoughtLogger.startSession("platform_interaction", {
		maxIterations,
		agentId: currentAgentId,
	});

	const model = "claude-3-5-haiku-latest";

	try {
		for (let iteration = 0; iteration < maxIterations; iteration++) {
			console.log(`\n--- Iteration ${iteration + 1}/${maxIterations} ---`);

			// Start new iteration in thought logger
			thoughtLogger.startIteration();

			// Log the iteration start
			await thoughtLogger.logPlanning(
				`Starting iteration ${iteration + 1}. Current goal: Interact with the Howl platform effectively.`,
				{
					currentGoal: "Interact with Howl platform",
					iterationNumber: iteration + 1,
				},
			);

			const response = await anthropic.beta.messages.create({
				model,
				max_tokens: 1024,
				system: systemPrompt,
				messages: currentMessages,
				tools: toolsSchema as any,
				betas: ["token-efficient-tools-2025-02-19"],
			});

			console.log("Response:", response);

			// Log the agent's reasoning/response
			const responseText = response.content
				.filter((content) => content.type === "text")
				.map((content) => content.text)
				.join("\n");

			if (responseText) {
				await thoughtLogger.logReasoning(`Agent response: ${responseText}`, {
					iterationNumber: iteration + 1,
				});
			}

			currentMessages.push({
				role: "assistant",
				content: JSON.stringify(response.content),
			});

			// Check if the LLM is done (no tool calls)
			const toolCalls = response.content.filter(
				(content) => content.type === "tool_use",
			);

			// If no tool calls, the LLM is done
			if (toolCalls.length === 0) {
				console.log("LLM completed - no more tool calls needed");
				await thoughtLogger.logReflection(
					"Agent completed interaction - no more tool calls needed",
					{ iterationNumber: iteration + 1 },
				);
				break;
			}

			console.log("Tool calls:", toolCalls);

			// Log the decision to use tools
			await thoughtLogger.logDecision(
				`Decided to use ${toolCalls.length} tool(s): ${toolCalls.map((call) => call.name).join(", ")}`,
				{ iterationNumber: iteration + 1 },
			);

			// Execute tool calls
			const toolCallResults = await Promise.all(
				toolCalls.map(async (call) => {
					const startTime = Date.now();
					try {
						// Log the tool call attempt
						await thoughtLogger.logObservation(
							`Attempting to call tool: ${call.name} with input: ${JSON.stringify(call.input)}`,
							{ iterationNumber: iteration + 1 },
						);

						const toolCallResult = await toolMap[
							call.name as keyof typeof toolMap
						](call.input as any);

						const executionTime = Date.now() - startTime;

						// Log successful tool call
						await thoughtLogger.logToolCall(
							call.name,
							call.input as Record<string, any>,
							toolCallResult,
							executionTime,
							true,
						);

						return {
							type: "tool_result",
							tool_use_id: call.id,
							content: toolCallResult,
						};
					} catch (error: unknown) {
						const executionTime = Date.now() - startTime;
						const errorMessage =
							error instanceof Error ? error.message : "Unknown error";

						console.error("Error executing tool call:", error);

						// Log failed tool call
						await thoughtLogger.logToolCall(
							call.name,
							call.input as Record<string, any>,
							null,
							executionTime,
							false,
							errorMessage,
						);

						return {
							type: "tool_result",
							tool_use_id: call.id,
							content: JSON.stringify({ error: errorMessage }),
						};
					}
				}),
			);
			console.log("Tool call results:", toolCallResults);

			// Log observation of tool results
			await thoughtLogger.logObservation(
				`Tool call results: ${JSON.stringify(toolCallResults)}`,
				{ iterationNumber: iteration + 1 },
			);

			currentMessages.push({
				role: "user",
				content: JSON.stringify(toolCallResults),
			});
		}

		console.log(
			`\n--- Conversation completed after ${currentMessages.length - messages.length} exchanges ---`,
		);

		// End the session successfully
		await thoughtLogger.endSession();
	} catch (error) {
		console.error("Session failed:", error);
		await thoughtLogger.logReflection(
			`Session failed with error: ${error instanceof Error ? error.message : "Unknown error"}`,
			{ iterationNumber: thoughtLogger.getCurrentIteration() },
		);
		await thoughtLogger.endSession();
		throw error;
	}
}

main().catch(console.error);
