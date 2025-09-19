import { Anthropic } from "@anthropic-ai/sdk";
import { createHowl, getHowls, getHowlsForUser } from "@howl/db/queries/howls";
import { getUserById } from "@howl/db/queries/users";
import { systemPrompt } from "./lib/prompts";
import { toolsSchema } from "./lib/tools";

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

const currentAgentId = "KbqZBn--bHcby1RKOiNf1";

async function getHowlsTool({
	limit,
}: {
	includeDeleted?: boolean;
	limit?: number;
}) {
	const howls = await getHowls({ limit });
	return howls.map((howl) => ({
		content: howl.content,
		username: howl.user?.username,
		id: howl.id,
		userId: howl.userId,
		createdAt: howl.createdAt,
		updatedAt: howl.updatedAt,
	}));
}

async function getHowlsForUserTool({ userId }: { userId: string }) {
	const user = await getUserById(userId);
	if (!user) {
		throw new Error("User not found");
	}
	const howls = await getHowlsForUser(user);
	return howls.map((howl) => ({
		content: howl.content,
		username: user.username,
		id: howl.id,
		userId: howl.userId,
		createdAt: howl.createdAt,
	}));
}

async function createHowlTool({
	content,
	parentId,
}: {
	content: string;
	parentId?: string;
}) {
	await createHowl({
		content,
		userId: currentAgentId,
		parentId,
	});
	return "Howl created successfully";
}
const messages = [
	{
		role: "user",
		content: `Please interact with the Howl platform as you see fit.  Create as few howls as possible.
			Your user id is ${currentAgentId}.`,
	},
];
const toolMap = {
	getHowls: getHowlsTool,
	createHowl: createHowlTool,
	getHowlsForUser: getHowlsForUserTool,
};

async function main() {
	const maxIterations = 10;
	const currentMessages = [...messages];
	// const model =
	// 	currentMessages[currentMessages.length - 1].content.type === "tool_use"
	// 		? "claude-4-sonnet-latest"
	// 		: "claude-3-7-sonnet-latest";

	const model = "claude-opus-4-0";
	for (let iteration = 0; iteration < maxIterations; iteration++) {
		console.log(`\n--- Iteration ${iteration + 1}/${maxIterations} ---`);

		const response = await anthropic.messages.create({
			model,
			max_tokens: 1024,
			system: systemPrompt,
			messages: currentMessages,
			tools: toolsSchema,
		});

		console.log("Response:", response);

		// Check if the LLM is done (no tool calls)
		const toolCalls = response.content.filter(
			(content) => content.type === "tool_use",
		);

		// Add assistant's response to conversation
		currentMessages.push({ role: "assistant", content: response.content });

		// If no tool calls, the LLM is done
		if (toolCalls.length === 0) {
			console.log("LLM completed - no more tool calls needed");
			console.log("Current messages:", currentMessages);
			break;
		}

		console.log("Tool calls:", toolCalls);

		// Execute tool calls
		const toolCallResults = await Promise.all(
			toolCalls.map(async (call) => {
				try {
					const toolCallResult = await toolMap[
						call.name as keyof typeof toolMap
					](call.input);
					return {
						type: "tool_result",
						tool_use_id: call.id,
						content: JSON.stringify(toolCallResult),
					};
				} catch (error: any) {
					console.error("Error executing tool call:", error);
					return {
						type: "tool_result",
						tool_use_id: call.id,
						content: JSON.stringify({ error: error?.message }),
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
	console.log("Current messages:", currentMessages);
}

main().catch(console.error);
