import {
	createAgentSession,
	type InsertAgentSession,
	updateAgentSession,
} from "@howl/db/queries/agent-sessions";
import {
	createAgentThought,
	type InsertAgentThought,
} from "@howl/db/queries/agent-thoughts";
import {
	createAgentToolCall,
	type InsertAgentToolCall,
} from "@howl/db/queries/agent-tool-calls";

export type ThoughtType =
	| "reasoning"
	| "decision"
	| "observation"
	| "planning"
	| "reflection"
	| "analysis"
	| "synthesis";

export interface ThoughtContext {
	iterationNumber: number;
	currentGoal?: string;
	previousActions?: string[];
	environmentState?: Record<string, unknown>;
	confidence?: number;
}

export class ThoughtLogger {
	private sessionId: string | null = null;
	private agentId: string;
	private currentIteration = 0;

	constructor(agentId: string) {
		this.agentId = agentId;
	}

	async startSession(
		sessionType: string = "interaction",
		metadata?: Record<string, unknown>,
	) {
		const sessionData: InsertAgentSession = {
			agentId: this.agentId,
			sessionType,
			metadata,
		};

		const session = await createAgentSession(sessionData);
		this.sessionId = session.id;
		this.currentIteration = 0;
		return session;
	}

	async endSession() {
		if (!this.sessionId) {
			throw new Error("No active session to end");
		}

		await updateAgentSession(this.sessionId, {
			totalIterations: this.currentIteration,
		});

		this.sessionId = null;
		this.currentIteration = 0;
	}

	async logThought(
		content: string,
		thoughtType: ThoughtType,
		context?: Partial<ThoughtContext>,
	) {
		if (!this.sessionId) {
			throw new Error("No active session. Call startSession() first.");
		}

		const thoughtData: InsertAgentThought = {
			sessionId: this.sessionId,
			iterationNumber: this.currentIteration,
			thoughtType,
			content,
			context: context
				? {
						...context,
						iterationNumber: this.currentIteration,
					}
				: { iterationNumber: this.currentIteration },
			confidence: context?.confidence,
		};

		return await createAgentThought(thoughtData);
	}

	async logToolCall(
		toolName: string,
		input: Record<string, unknown>,
		output: unknown,
		executionTimeMs: number,
		success: boolean = true,
		errorMessage?: string,
		thoughtId?: string,
	) {
		if (!this.sessionId) {
			throw new Error("No active session. Call startSession() first.");
		}

		const toolCallData: InsertAgentToolCall = {
			sessionId: this.sessionId,
			thoughtId: thoughtId || null,
			iterationNumber: this.currentIteration,
			toolName,
			input,
			output: typeof output === "string" ? output : JSON.stringify(output),
			executionTimeMs,
			success,
			errorMessage,
		};

		return await createAgentToolCall(toolCallData);
	}

	startIteration() {
		this.currentIteration++;
	}

	getCurrentIteration() {
		return this.currentIteration;
	}

	getSessionId() {
		return this.sessionId;
	}

	// Convenience methods for common thought types
	async logReasoning(content: string, context?: Partial<ThoughtContext>) {
		return this.logThought(content, "reasoning", context);
	}

	async logDecision(content: string, context?: Partial<ThoughtContext>) {
		return this.logThought(content, "decision", context);
	}

	async logObservation(content: string, context?: Partial<ThoughtContext>) {
		return this.logThought(content, "observation", context);
	}

	async logPlanning(content: string, context?: Partial<ThoughtContext>) {
		return this.logThought(content, "planning", context);
	}

	async logReflection(content: string, context?: Partial<ThoughtContext>) {
		return this.logThought(content, "reflection", context);
	}
}
