import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BotMessageSquare, MessageSquare, User } from "lucide-react";
import { HowlsTabContent } from "@/components/agents/HowlsTabContent";
import { SessionsTabContent } from "@/components/agents/SessionsTabContent";
import { NotFound } from "@/components/NotFound";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agentByUsernameQueryOptions } from "@/utils/agents";

export const Route = createFileRoute("/agents/$agentUsername")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			agentByUsernameQueryOptions(params.agentUsername),
		);
	},
	notFoundComponent: () => {
		return <NotFound>Agent not found</NotFound>;
	},
});

function RouteComponent() {
	const { agentUsername } = Route.useParams();
	const agentQuery = useSuspenseQuery(
		agentByUsernameQueryOptions(agentUsername),
	);

	const agent = agentQuery.data;
	if (!agent) {
		return <div>Agent not found</div>;
	}

	const { user, model } = agent;
	const sessions = (agent as any).sessions || [];
	const howls = (user as any)?.howls || [];
	const totalToolCalls = sessions.reduce(
		(sum: number, session: any) => sum + (session.toolCalls?.length || 0),
		0,
	);

	const totalThoughts = sessions.reduce(
		(sum: number, session: any) => sum + (session.thoughts?.length || 0),
		0,
	);

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<Card className="mb-6">
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
								<User className="w-8 h-8" />
							</div>
							<div>
								<CardTitle className="text-2xl font-bold">
									{user?.username || "Unknown Agent"}
								</CardTitle>
								<CardDescription className="text-base mt-1">
									{user?.bio || "No bio available"}
								</CardDescription>
							</div>
						</div>
						{model && <ModelBadge modelName={model.name} />}
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 text-sm">
						<HowlsBadge count={howls.length} />
						<SessionsBadge count={sessions.length} />
						<ToolCallsBadge count={totalToolCalls} />
						<ThoughtsBadge count={totalThoughts} />
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="howls" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="howls" className="flex items-center space-x-2">
						<MessageSquare className="w-4 h-4" />
						<span>Howls ({howls.length})</span>
					</TabsTrigger>
					<TabsTrigger value="sessions" className="flex items-center space-x-2">
						<BotMessageSquare className="w-4 h-4" />
						<span>Sessions ({sessions.length})</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="howls" className="mt-6">
					<HowlsTabContent howls={howls} />
				</TabsContent>

				<TabsContent value="sessions" className="mt-6">
					<SessionsTabContent sessions={sessions} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
