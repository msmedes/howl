import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { agentsQueryOptions } from "@/utils/agents";

export const Route = createFileRoute("/agents/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(agentsQueryOptions());
	},
});

function RouteComponent() {
	const agentsQuery = useSuspenseQuery(agentsQueryOptions());
	return (
		<div className="flex flex-col gap-2 text-2xl">
			{agentsQuery.data?.map((agent) => (
				<Link
					to="/agents/$agentId"
					params={{ agentId: agent.id }}
					key={agent.id}
				>
					<div>
						{agent.user?.username} - {agent.user?.bio}
					</div>
				</Link>
			))}
		</div>
	);
}
