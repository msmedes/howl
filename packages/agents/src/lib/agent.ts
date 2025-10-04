import { Anthropic } from "@anthropic-ai/sdk";
import type { AgentWithRelations, Model } from "@howl/db/schema";
import { nanoid } from "nanoid";
import { systemPrompt } from "./prompts";
import { toolMap } from "./tools";
import toolsSchema from "./tools-schema";

export default class Agent {
	private maxIterations: number;
	private model: Model;
	private agent: AgentWithRelations;
	private agentPrompt: string;
	private systemPrompt: string;
	private messages: Array<{ role: "user" | "assistant"; content: string }>;
	private client: Anthropic;
	private maxTokens: number;
	private sessionId: string;

	constructor(agent: AgentWithRelations) {
		this.agent = agent;
		this.maxIterations = 10;
		this.model = {
			name: "claude-3-7-sonnet-latest",
			id: "claude-3-7-sonnet-latest",
		};
		this.agentPrompt = agent.prompt;
		this.systemPrompt = systemPrompt;
		this.messages = [];
		this.maxTokens = 1024;
		this.client = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		});
		this.sessionId = nanoid(10);
		this.initializeMessages();
	}

	private initializeMessages() {
		this.messages.push({
			role: "user",
			content: `${this.agentPrompt} your user id is ${this.agent.user?.agentFriendlyId}, your username is ${this.agent.user?.username}`,
		});
	}

	private async processToolCall(toolCall: any) {
		const toolCallResult = await toolMap[toolCall.name as keyof typeof toolMap](
			{
				...toolCall.input,
				currentAgentId: this.agent.user?.id,
				sessionId: this.sessionId,
			} as any,
		);

		return toolCallResult;
	}

	private logSession() {
		console.log(
			`\n--- Session completed after ${this.messages.length} exchanges ---`,
		);
		console.log("Messages:", JSON.stringify(this.messages));
	}
	catch(error: unknown) {
		console.error("Session failed:", error);
		throw error;
	}

	async runConversationTurn() {
		const assistantContent = [];
		const toolResults = [];

		const response = await this.client.beta.messages.create({
			model: this.model.name,
			max_tokens: this.maxTokens,
			system: this.systemPrompt,
			messages: this.messages,
			tools: toolsSchema as any,
			betas: ["token-efficient-tools-2025-02-19"],
		});

		for (const content of response.content) {
			if (content.type === "text") {
				assistantContent.push({ type: "text", text: content.text });
			} else if (content.type === "tool_use") {
				const toolResult = await this.processToolCall(content);
				assistantContent.push({
					type: "tool_use",
					id: content.id,
					name: content.name,
					input: content.input,
				});
				toolResults.push({
					type: "tool_result",
					tool_use_id: content.id,
					content: toolResult,
				});
			}
		}
		return { response, assistantContent, toolResults };
	}

	async run() {
		let turn = 1;
		while (turn <= this.maxIterations) {
			try {
				console.log(`\n--- Iteration ${turn + 1}/${this.maxIterations} ---`);
				const { response, assistantContent, toolResults } =
					await this.runConversationTurn();

				this.messages.push({ role: "assistant", content: assistantContent });
				if (toolResults.length > 0) {
					this.messages.push({ role: "user", content: toolResults });
					turn++;
				} else {
					break;
				}
			} catch (error: unknown) {
				console.error("Iteration failed:", error);
				throw error;
			}
		}
		this.logSession();
	}
}
