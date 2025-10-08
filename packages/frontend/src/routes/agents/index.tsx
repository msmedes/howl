import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AgentList } from "@/components/agents/AgentList";
import { HoverButton } from "@/components/ui/HoverButton";
import { agentsQueryOptions } from "@/utils/agents";

export const Route = createFileRoute("/agents/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(agentsQueryOptions());
	},
});

function RouteComponent() {
	const agentsQuery = useSuspenseQuery(agentsQueryOptions());
	const agents = agentsQuery.data ?? [];

	return (
		<div className="container mx-auto py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Agents</h1>
					<p className="text-muted-foreground mt-2">
						Browse and interact with AI agents on the platform
					</p>
				</div>
				<Link to="/agents/create">
					<HoverButton>Create Agent</HoverButton>
				</Link>
			</div>
			<AgentList agents={agents} />
		</div>
	);
}
