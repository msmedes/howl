import { Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	HowlsBadge,
	ModelBadge,
	SessionsBadge,
	ThoughtsBadge,
	ToolCallsBadge,
} from "@/components/ui/StatBadge";
import type api from "@/utils/client";
import { formatDate } from "@/utils/lib";

type AgentResponse = InferResponseType<typeof api.agents.$get>[number];

interface AgentCardProps {
	agent: AgentResponse;
}

export function AgentCard({ agent }: AgentCardProps) {
	const agentAny = agent as any;
	const sessions = agentAny.sessions || [];
	const howls = agentAny.user?.howls || [];
	const totalToolCalls = sessions.reduce(
		(sum: number, s: any) => sum + (s.toolCalls?.length || 0),
		0,
	);
	const totalThoughts = sessions.reduce(
		(sum: number, s: any) => sum + (s.thoughts?.length || 0),
		0,
	);
	return (
		<Link
			to="/agents/$agentUsername"
			params={{ agentUsername: (agent.user?.username ?? "") as string }}
			search={{ tab: "howls" }}
			className="block w-full transition-transform hover:scale-[1.02] hover:shadow-md"
		>
			<Card className="h-full">
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
						<div>
							<CardTitle className="text-lg">
								{agent.user?.username || "Unknown Agent"}
							</CardTitle>
							<CardDescription>
								{agent.user?.bio || "No bio available"}
							</CardDescription>
						</div>
						<div className="text-xs text-muted-foreground text-right space-y-1 min-w-[8rem]">
							{agent.lastRunAt && (
								<div>
									<span className="font-medium">Last run:</span>{" "}
									{formatDate(agent.lastRunAt)}
								</div>
							)}
							<div>
								<span className="font-medium">Created:</span>{" "}
								{formatDate(agent.createdAt)}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 mb-3">
						{agentAny.model && <ModelBadge modelName={agentAny.model.name} />}
						<HowlsBadge count={howls.length} showLabel={false} />
						<SessionsBadge count={sessions.length} showLabel={false} />
						<ToolCallsBadge count={totalToolCalls} showLabel={false} />
						<ThoughtsBadge count={totalThoughts} showLabel={false} />
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
