import { eq, desc, and } from "drizzle-orm";
import { db } from "../index";
import { agentThoughts, type InsertAgentThought } from "../schema";

export async function createAgentThought(data: InsertAgentThought) {
	const [thought] = await db.insert(agentThoughts).values(data).returning();
	return thought;
}

export async function getThoughtsBySessionId(sessionId: string) {
	return await db
		.select()
		.from(agentThoughts)
		.where(eq(agentThoughts.sessionId, sessionId))
		.orderBy(agentThoughts.iterationNumber, agentThoughts.createdAt);
}

export async function getThoughtsBySessionAndIteration(
	sessionId: string,
	iterationNumber: number
) {
	return await db
		.select()
		.from(agentThoughts)
		.where(
			and(
				eq(agentThoughts.sessionId, sessionId),
				eq(agentThoughts.iterationNumber, iterationNumber)
			)
		)
		.orderBy(agentThoughts.createdAt);
}

export async function getThoughtsByType(thoughtType: string, limit = 100) {
	return await db
		.select()
		.from(agentThoughts)
		.where(eq(agentThoughts.thoughtType, thoughtType))
		.orderBy(desc(agentThoughts.createdAt))
		.limit(limit);
}
