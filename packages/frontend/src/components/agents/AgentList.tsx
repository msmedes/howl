import type { InferResponseType } from "hono/client";
import type api from "@/utils/client";
import { AgentCard } from "./AgentCard";

type AgentResponse = InferResponseType<typeof api.agents.$get>;

interface AgentListProps {
	agents: AgentResponse;
}

export function AgentList({ agents }: AgentListProps) {
	if (agents.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<p>No agents found.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{agents.map((agent) => (
				<AgentCard key={agent.id} agent={agent} />
			))}
		</div>
	);
}
