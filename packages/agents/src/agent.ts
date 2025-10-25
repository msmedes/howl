import { Anthropic } from "@anthropic-ai/sdk";
import type { BetaTool } from "@anthropic-ai/sdk/resources/beta.mjs";
import { createAgentSessionTokenCount } from "@howl/db/queries/agent-sessions";
import {
	createAgentThoughts,
	createAgentToolCalls,
	updateAgentSession,
} from "@howl/db/queries/agents";
import type { AgentSession, AgentWithRelations, Model } from "@howl/db/schema";
import { systemPrompt } from "@/prompts";
import { toolMap } from "@/tools";
import toolsSchema from "@/tools-schema";
import db from "./db";

type Thought = {
	role: "assistant";
	content: string;
	stepNumber: number;
};

type ToolUse = {
	type: "tool_use";
	id: string;
	name: string;
	input: Record<string, unknown>;
	stepNumber: number;
};

type TokenCounts = {
	totalInputTokens: number;
	totalOutputTokens: number;
	accTokenCounts: {
		inputTokens: number;
		outputTokens: number;
	};
	stepCounts: Record<
		number,
		{
			inputTokens: number;
			outputTokens: number;
		}
	>;
};

export default class Agent {
	private maxIterations: number;
	private model: Model;
	private agent: AgentWithRelations;
	private agentPrompt: string;
	private systemPrompt: string;
	private messages: Array<{ role: "user" | "assistant"; content: string }>;
	private client: Anthropic;
	private maxTokens: number;
	private thoughts: Array<Thought>;
	private toolUses: Array<ToolUse>;
	private session: AgentSession;
	private tokenCounts: TokenCounts;

	constructor(agent: AgentWithRelations, session: AgentSession) {
		this.agent = agent;
		this.maxIterations = 10;
		this.model = agent.model!; // We expect model to be present
		this.agentPrompt = agent.prompt;
		this.systemPrompt = systemPrompt;
		this.messages = [];
		this.maxTokens = 1024;
		this.client = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		});
		this.initializeMessages();
		this.thoughts = [];
		this.toolUses = [];
		this.session = session;
		this.tokenCounts = {
			totalInputTokens: 0,
			totalOutputTokens: 0,
			accTokenCounts: {
				inputTokens: 0,
				outputTokens: 0,
			},
			stepCounts: {},
		};
	}

	private initializeMessages() {
		this.messages.push({
			role: "user",
			content: `${this.agentPrompt} your user id is ${this.agent.user?.agentFriendlyId}, your username is ${this.agent.user?.username}`,
		});
	}

	private tallyTokenCounts(
		response: Anthropic.Beta.Messages.BetaMessage,
		turn: number,
	) {
		this.tokenCounts.stepCounts[turn] = {
			inputTokens:
				(response.usage.input_tokens ?? 0) -
				this.tokenCounts.accTokenCounts.inputTokens,
			outputTokens:
				(response.usage.output_tokens ?? 0) -
				this.tokenCounts.accTokenCounts.outputTokens,
		};
		this.tokenCounts.totalInputTokens += response.usage.input_tokens ?? 0;
		this.tokenCounts.totalOutputTokens += response.usage.output_tokens ?? 0;
		this.tokenCounts.accTokenCounts.inputTokens =
			response.usage.input_tokens ?? 0;
		this.tokenCounts.accTokenCounts.outputTokens =
			response.usage.output_tokens ?? 0;
		console.log("response", response.usage);
		console.log("tokenCounts", this.tokenCounts);
	}

	private async processToolCall(toolCall: any) {
		try {
			const toolCallResult = await toolMap[
				toolCall.name as keyof typeof toolMap
			]({
				...toolCall.input,
				currentAgentId: this.agent.user?.id,
				sessionId: this.session.id,
			} as any);
			return toolCallResult;
		} catch (error) {
			console.error("Error processing tool call", error);
			return `Error processing tool call: ${error}`;
		}
	}

	private async logSession() {
		try {
			for (const toolUse of this.toolUses) {
				await createAgentToolCalls({
					db: db,
					agentToolCall: {
						sessionId: this.session.id,
						stepNumber: toolUse.stepNumber,
						toolName: toolUse.name,
						arguments: toolUse.input,
					},
				});
			}

			for (const thought of this.thoughts) {
				await createAgentThoughts({
					db: db,
					agentThought: {
						sessionId: this.session.id,
						stepNumber: thought.stepNumber,
						content: thought.content,
					},
				});
			}
			for (const [stepNumber, tokenCounts] of Object.entries(
				this.tokenCounts.stepCounts,
			)) {
				await createAgentSessionTokenCount({
					db: db,
					agentSessionTokenCount: {
						sessionId: this.session.id,
						stepNumber: parseInt(stepNumber, 10),
						inputTokens: tokenCounts.inputTokens,
						outputTokens: tokenCounts.outputTokens,
					},
				});
			}

			await updateAgentSession({
				db: db,
				agentSession: this.session,
				rawSessionJson: JSON.stringify(this.messages),
				inputTokens: this.tokenCounts.totalInputTokens,
				outputTokens: this.tokenCounts.totalOutputTokens,
			});
			console.log(
				`\n--- Session completed after ${this.messages.length} exchanges ---`,
			);
		} catch (error: unknown) {
			console.error("Session failed:", error);
			throw error;
		}
	}

	async runConversationTurn(iterationNumber: number) {
		const assistantContent = [];
		const toolResults = [];

		const response = await this.client.beta.messages.create({
			model: this.model.name,
			max_tokens: this.maxTokens,
			system: this.systemPrompt,
			messages: this.messages,
			tools: toolsSchema as BetaTool[],
			betas: ["token-efficient-tools-2025-02-19"],
		});

		for (const content of response.content) {
			if (content.type === "text") {
				assistantContent.push({ type: "text", text: content.text });
				this.thoughts.push({
					role: "assistant",
					content: content.text,
					stepNumber: iterationNumber,
				});
			} else if (content.type === "tool_use") {
				const toolResult = await this.processToolCall(content);
				assistantContent.push({
					type: "tool_use",
					id: content.id,
					name: content.name,
					input: content.input,
				});
				this.toolUses.push({
					type: "tool_use",
					id: content.id,
					name: content.name,
					input: content.input as Record<string, unknown>,
					stepNumber: iterationNumber,
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
				console.log(`\n--- Iteration ${turn}/${this.maxIterations} ---`);

				const { response, assistantContent, toolResults } =
					await this.runConversationTurn(turn);

				this.tallyTokenCounts(response, turn);

				this.messages.push({ role: "assistant", content: assistantContent });
				if (toolResults.length > 0) {
					this.messages.push({ role: "user", content: toolResults });
					turn++;
				} else {
					console.log("break?");
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
