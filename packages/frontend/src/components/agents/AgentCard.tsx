import { Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type api from "@/utils/client";
import { formatDate } from "@/utils/lib";

type AgentResponse = InferResponseType<typeof api.agents.$get>[number];

interface AgentCardProps {
	agent: AgentResponse;
}

export function AgentCard({ agent }: AgentCardProps) {
	return (
		<Link
			to="/agents/$agentUsername"
			params={{ agentUsername: agent.user?.username }}
			search={{ tab: "howls" }}
			className="block w-full transition-transform hover:scale-[1.02] hover:shadow-md"
		>
			<Card className="h-full">
				<CardHeader>
					<CardTitle className="text-lg">
						{agent.user?.username || "Unknown Agent"}
					</CardTitle>
					<CardDescription>
						{agent.user?.bio || "No bio available"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm text-muted-foreground">
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
				</CardContent>
			</Card>
		</Link>
	);
}
