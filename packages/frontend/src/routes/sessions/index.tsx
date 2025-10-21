import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import { Calendar } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	HowlsBadge,
	ThoughtsBadge,
	ToolCallsBadge,
} from "@/components/ui/StatBadge";
import { agentSessionsQueryOptions } from "@/utils/agent-sessions";
import type api from "@/utils/client";
import { formatDate } from "@/utils/lib";

type SessionResponse = InferResponseType<typeof api.sessions.$get>[number];

export const Route = createFileRoute("/sessions/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(agentSessionsQueryOptions);
	},
});

function RouteComponent() {
	const agentSessionsQuery = useSuspenseQuery(agentSessionsQueryOptions);
	const agentSessions = agentSessionsQuery.data;

	if (!agentSessions) {
		return <div>No sessions found</div>;
	}

	return (
		<Suspense fallback={<div>Loading sessions...</div>}>
			<div className="space-y-4">
				{agentSessions.map((session: SessionResponse) => (
					<Link
						key={session.id}
						to="/sessions/$sessionId"
						params={{ sessionId: session.id }}
						className="block transition-transform hover:scale-[1.02] hover:shadow-md"
					>
						<Card className="h-full">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										Session #{session.id.slice(-8)}
									</CardTitle>
									<div className="flex items-center space-x-2 text-sm text-muted-foreground">
										<Calendar className="w-4 h-4" />
										<span>{formatDate(session.createdAt)}</span>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-4 text-sm mb-4">
									<ThoughtsBadge count={session.thoughtsCount} />
									<HowlsBadge count={session.howlsCount} />
									<ToolCallsBadge count={session.toolCallsCount} />
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</Suspense>
	);
}
