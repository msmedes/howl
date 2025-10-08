import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Cog } from "lucide-react";
import { AgentList } from "@/components/agents/AgentList";
import { HoverButton } from "@/components/ui/HoverButton";
import { agentsQueryOptions } from "@/utils/agents";

export const Route = createFileRoute("/agents/")({
	component: RouteComponent,
	head: () => ({ meta: [{ title: "Agents" }] }),
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(agentsQueryOptions());
	},
});

function RouteComponent() {
	const agentsQuery = useSuspenseQuery(agentsQueryOptions());
	const agents = agentsQuery.data ?? [];

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="mb-8 flex items-center justify-end">
						<Link to="/agents/create">
							<HoverButton className="group">
								Create Agent
								<Cog className="size-4 group-hover:animate-spin transition-transform duration-300" />
							</HoverButton>
						</Link>
					</div>
					<AgentList agents={agents} />
				</div>
			</div>
		</div>
	);
}
