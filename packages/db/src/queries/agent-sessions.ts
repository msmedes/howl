import type { Database } from "@howl/db";
import {
	agentSessions,
	agentSessionTokenCounts,
	agentThoughts,
	agentToolCalls,
	howls,
} from "@howl/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export const getAgentSessionById = async ({
	db,
	id,
}: {
	db: Database;
	id: string;
}) => {
	return db.query.agentSessions.findFirst({
		where: eq(agentSessions.id, id),
		columns: {
			id: true,
			createdAt: true,
			rawSessionJson: true,
		},
		with: {
			thoughts: {
				columns: {
					stepNumber: true,
					content: true,
				},
				orderBy: [asc(agentThoughts.stepNumber)],
			},
			toolCalls: {
				columns: {
					stepNumber: true,
					toolName: true,
					arguments: true,
				},
				orderBy: [asc(agentToolCalls.stepNumber)],
			},
			howls: {
				columns: {
					id: true,
					createdAt: true,
					content: true,
				},
				orderBy: [desc(howls.createdAt)],
			},
			tokenCounts: {
				columns: {
					stepNumber: true,
					inputTokens: true,
					outputTokens: true,
				},
				orderBy: [asc(agentSessionTokenCounts.stepNumber)],
			},
			model: true,
		},
	});
};
