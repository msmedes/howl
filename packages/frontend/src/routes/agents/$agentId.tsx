import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { agentQueryOptions } from "@/utils/agents";

export const Route = createFileRoute("/agents/$agentId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			agentQueryOptions(params.agentId),
		);
	},
});

function RouteComponent() {
	const { agentId } = Route.useParams();
	const agentQuery = useSuspenseQuery(agentQueryOptions(agentId));
	return <div>{agentQuery.data?.user?.username}</div>;
}
