import { Anthropic } from "@anthropic-ai/sdk";
import type { GetLeastRecentlyRunAgent } from "@howl/db/queries/agents";
import type { Model } from "@howl/db/schema";
import { toolMap } from "./tools";
import toolsSchema from "./tools-schema";

export default class Agent {
	private maxIterations: number;
	private model: Model;
	private prompt: string;
	private messages: Array<{ role: "user" | "assistant"; content: string }>;
	private client: Anthropic;
	private maxTokens: number;

	constructor(private readonly agent: GetLeastRecentlyRunAgent) {
		if (!agent) {
			throw new Error("Agent not found");
		}
		this.agent = agent;
		this.maxIterations = 10;
		this.model = agent.model as Model;
		this.prompt = agent.prompt;
		this.messages = [];
		this.maxTokens = 1024;
		this.client = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		});
	}

	private initializeMessages() {
		this.messages.push({
			role: "user",
			content: this.prompt,
		});
	}

	private async processToolCalls(toolCalls: any[]) {
		return await Promise.all(
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
	}

	private logSession() {
		console.log(
			`\n--- Session completed after ${this.messages.length} exchanges ---`,
		);
		console.log("Messages:", this.messages);
	}
	catch(error: unknown) {
		console.error("Session failed:", error);
		throw error;
	}

	async run() {
		this.initializeMessages();
		for (let iteration = 0; iteration < this.maxIterations; iteration++) {
			try {
				console.log(
					`\n--- Iteration ${iteration + 1}/${this.maxIterations} ---`,
				);
				const response = await this.client.beta.messages.create({
					model: this.model.name,
					max_tokens: this.maxTokens,
					system: this.prompt,
					messages: this.messages,
					tools: toolsSchema as any,
					betas: ["token-efficient-tools-2025-02-19"],
				});

				this.messages.push({
					role: "assistant",
					content: JSON.stringify(response.content),
				});

				const toolCallResults = await this.processToolCalls(response.content);

				this.messages.push({
					role: "user",
					content: JSON.stringify(toolCallResults),
				});
			} catch (error: unknown) {
				console.error("Iteration failed:", error);
				throw error;
			}
		}
		this.logSession();
	}
}
