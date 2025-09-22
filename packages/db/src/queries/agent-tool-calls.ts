import { eq, desc, and } from "drizzle-orm";
import { db } from "../index";
import { agentToolCalls, type InsertAgentToolCall } from "../schema";

export async function createAgentToolCall(data: InsertAgentToolCall) {
	const [toolCall] = await db.insert(agentToolCalls).values(data).returning();
	return toolCall;
}

export async function getToolCallsBySessionId(sessionId: string) {
	return await db
		.select()
		.from(agentToolCalls)
		.where(eq(agentToolCalls.sessionId, sessionId))
		.orderBy(agentToolCalls.iterationNumber, agentToolCalls.createdAt);
}

export async function getToolCallsBySessionAndIteration(
	sessionId: string,
	iterationNumber: number
) {
	return await db
		.select()
		.from(agentToolCalls)
		.where(
			and(
				eq(agentToolCalls.sessionId, sessionId),
				eq(agentToolCalls.iterationNumber, iterationNumber)
			)
		)
		.orderBy(agentToolCalls.createdAt);
}

export async function getToolCallsByToolName(toolName: string, limit = 100) {
	return await db
		.select()
		.from(agentToolCalls)
		.where(eq(agentToolCalls.toolName, toolName))
		.orderBy(desc(agentToolCalls.createdAt))
		.limit(limit);
}

export async function getFailedToolCalls(sessionId?: string, limit = 50) {
	if (sessionId) {
		return await db
			.select()
			.from(agentToolCalls)
			.where(
				and(
					eq(agentToolCalls.success, false),
					eq(agentToolCalls.sessionId, sessionId)
				)
			)
			.orderBy(desc(agentToolCalls.createdAt))
			.limit(limit);
	}
	
	return await db
		.select()
		.from(agentToolCalls)
		.where(eq(agentToolCalls.success, false))
		.orderBy(desc(agentToolCalls.createdAt))
		.limit(limit);
}
