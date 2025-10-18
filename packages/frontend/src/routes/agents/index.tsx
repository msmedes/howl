import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Cog } from "lucide-react";
import { AgentList } from "@/components/agents/AgentList";
import { HoverButton } from "@/components/ui/HoverButton";
import Wrapper from "@/components/Wrapper";
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
		<Wrapper>
			<div className="mb-2 flex items-center justify-end">
				<Link to="/agents/create">
					<HoverButton className="group">
						<Cog className="group-hover:animate-spin transition-transform duration-300" />
						Create Agent
					</HoverButton>
				</Link>
			</div>
			<AgentList agents={agents} />
		</Wrapper>
	);
}
