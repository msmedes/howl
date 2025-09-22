import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { agentSessions, agentThoughts, agentToolCalls } from "../schema";

// Get a complete thought chain for a session
export async function getSessionThoughtChain(sessionId: string) {
	const thoughts = await db
		.select()
		.from(agentThoughts)
		.where(eq(agentThoughts.sessionId, sessionId))
		.orderBy(agentThoughts.iterationNumber, agentThoughts.createdAt);

	const toolCalls = await db
		.select()
		.from(agentToolCalls)
		.where(eq(agentToolCalls.sessionId, sessionId))
		.orderBy(agentToolCalls.iterationNumber, agentToolCalls.createdAt);

	return { thoughts, toolCalls };
}

// Get agent's reasoning patterns
export async function getAgentReasoningPatterns(agentId: string, limit = 100) {
	return await db
		.select({
			thoughtType: agentThoughts.thoughtType,
			count: count(),
			avgConfidence: sql<number>`AVG(${agentThoughts.confidence})`,
		})
		.from(agentThoughts)
		.innerJoin(agentSessions, eq(agentThoughts.sessionId, agentSessions.id))
		.where(eq(agentSessions.agentId, agentId))
		.groupBy(agentThoughts.thoughtType)
		.orderBy(desc(count()));
}

// Get most common tool usage patterns
export async function getAgentToolUsageStats(agentId: string) {
	return await db
		.select({
			toolName: agentToolCalls.toolName,
			count: count(),
			successRate: sql<number>`AVG(CASE WHEN ${agentToolCalls.success} THEN 1.0 ELSE 0.0 END)`,
			avgExecutionTime: sql<number>`AVG(${agentToolCalls.executionTimeMs})`,
		})
		.from(agentToolCalls)
		.innerJoin(agentSessions, eq(agentToolCalls.sessionId, agentSessions.id))
		.where(eq(agentSessions.agentId, agentId))
		.groupBy(agentToolCalls.toolName)
		.orderBy(desc(count()));
}

// Get failed tool calls for debugging
export async function getAgentFailures(agentId: string, limit = 50) {
	return await db
		.select({
			sessionId: agentToolCalls.sessionId,
			toolName: agentToolCalls.toolName,
			input: agentToolCalls.input,
			errorMessage: agentToolCalls.errorMessage,
			createdAt: agentToolCalls.createdAt,
		})
		.from(agentToolCalls)
		.innerJoin(agentSessions, eq(agentToolCalls.sessionId, agentSessions.id))
		.where(
			and(
				eq(agentSessions.agentId, agentId),
				eq(agentToolCalls.success, false),
			),
		)
		.orderBy(desc(agentToolCalls.createdAt))
		.limit(limit);
}

// Get agent's decision-making confidence over time
export async function getAgentConfidenceTrend(agentId: string, limit = 100) {
	return await db
		.select({
			sessionId: agentThoughts.sessionId,
			iterationNumber: agentThoughts.iterationNumber,
			confidence: agentThoughts.confidence,
			thoughtType: agentThoughts.thoughtType,
			createdAt: agentThoughts.createdAt,
		})
		.from(agentThoughts)
		.innerJoin(agentSessions, eq(agentThoughts.sessionId, agentSessions.id))
		.where(
			and(
				eq(agentSessions.agentId, agentId),
				sql`${agentThoughts.confidence} IS NOT NULL`,
			),
		)
		.orderBy(desc(agentThoughts.createdAt))
		.limit(limit);
}

