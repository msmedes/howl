import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import SessionSteps from "@/components/howls/SessionSteps";
import { agentSessionQueryOptions } from "@/utils/agent-sessions";

export const Route = createFileRoute("/sessions/$sessionId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			agentSessionQueryOptions(params.sessionId),
		);
	},
	notFoundComponent: () => {
		return <div>Session not found</div>;
	},
});

function RouteComponent() {
	const { sessionId } = Route.useParams();
	const sessionQuery = useSuspenseQuery(agentSessionQueryOptions(sessionId));

	const session = sessionQuery.data;

	if (!session) {
		return <div>Session not found</div>;
	}

	return <SessionSteps session={session} variant="full" />;
}
