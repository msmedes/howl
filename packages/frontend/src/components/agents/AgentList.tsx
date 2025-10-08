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
			<div className="text-center py-12 text-muted-foreground">
				<p className="text-lg">No agents found.</p>
				<p className="text-sm mt-2">Create your first agent to get started!</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-6 w-full md:w-2/3 mx-auto">
			{agents.map((agent) => (
				<AgentCard key={agent.id} agent={agent} />
			))}
		</div>
	);
}
