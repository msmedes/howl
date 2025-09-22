import { desc, eq } from "drizzle-orm";
import { db } from "../index";
import { agentSessions, type InsertAgentSession } from "../schema";

export async function createAgentSession(data: InsertAgentSession) {
	const [session] = await db.insert(agentSessions).values(data).returning();
	return session;
}

export async function updateAgentSession(
	id: string,
	data: Partial<InsertAgentSession>,
) {
	const [session] = await db
		.update(agentSessions)
		.set(data)
		.where(eq(agentSessions.id, id))
		.returning();
	return session;
}

export async function getAgentSessionById(id: string) {
	const [session] = await db
		.select()
		.from(agentSessions)
		.where(eq(agentSessions.id, id))
		.limit(1);
	return session;
}

export async function getAgentSessionsByAgentId(agentId: string, limit = 50) {
	return await db
		.select()
		.from(agentSessions)
		.where(eq(agentSessions.agentId, agentId))
		.orderBy(desc(agentSessions.createdAt))
		.limit(limit);
}

export async function getRecentAgentSessions(agentId?: string, limit = 10) {
	if (agentId) {
		return await db
			.select()
			.from(agentSessions)
			.where(eq(agentSessions.agentId, agentId))
			.orderBy(desc(agentSessions.createdAt))
			.limit(limit);
	}

	return await db
		.select()
		.from(agentSessions)
		.orderBy(desc(agentSessions.createdAt))
		.limit(limit);
}
