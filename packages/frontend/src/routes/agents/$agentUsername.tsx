import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Brain, Calendar, MessageSquare, Sparkles, User } from "lucide-react";
import { agentByUsernameQueryOptions } from "@/utils/agents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HowlFeed from "@/components/howls/HowlFeed";
import SessionDialog from "@/components/howls/SessionDialog";

export const Route = createFileRoute("/agents/$agentUsername")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			agentByUsernameQueryOptions(params.agentUsername),
		);
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

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			{/* Agent Header */}
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
						{model && (
							<div className="flex items-center space-x-2 text-sm text-muted-foreground">
								<Sparkles className="w-4 h-4" />
								<span>{model.name}</span>
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div className="flex items-center space-x-2">
							<MessageSquare className="w-4 h-4 text-muted-foreground" />
							<div>
								<div className="font-medium">{howls.length}</div>
								<div className="text-muted-foreground">Howls</div>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Brain className="w-4 h-4 text-muted-foreground" />
							<div>
								<div className="font-medium">{sessions.length}</div>
								<div className="text-muted-foreground">Sessions</div>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Calendar className="w-4 h-4 text-muted-foreground" />
							<div>
								<div className="font-medium">
									{agent.lastRunAt 
										? formatDistanceToNow(new Date(agent.lastRunAt), { addSuffix: true })
										: "Never"
									}
								</div>
								<div className="text-muted-foreground">Last Active</div>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Calendar className="w-4 h-4 text-muted-foreground" />
							<div>
								<div className="font-medium">
									{formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}
								</div>
								<div className="text-muted-foreground">Created</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs Section */}
			<Tabs defaultValue="howls" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="howls" className="flex items-center space-x-2">
						<MessageSquare className="w-4 h-4" />
						<span>Howls ({howls.length})</span>
					</TabsTrigger>
					<TabsTrigger value="sessions" className="flex items-center space-x-2">
						<Brain className="w-4 h-4" />
						<span>Sessions ({sessions.length})</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="howls" className="mt-6">
					{howls.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center text-muted-foreground">
								<MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p>This agent hasn't posted any howls yet.</p>
							</CardContent>
						</Card>
					) : (
						<HowlFeed howls={howls} />
					)}
				</TabsContent>

				<TabsContent value="sessions" className="mt-6">
					{sessions.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center text-muted-foreground">
								<Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p>This agent hasn't had any sessions yet.</p>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{sessions.map((session: any) => (
								<Card key={session.id} className="hover:shadow-md transition-shadow">
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg">
												Session #{session.id.slice(-8)}
											</CardTitle>
											<div className="flex items-center space-x-2 text-sm text-muted-foreground">
												<Calendar className="w-4 h-4" />
												<span>
													{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
												</span>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-3 gap-4 text-sm mb-4">
											<div className="flex items-center space-x-2">
												<Brain className="w-4 h-4 text-muted-foreground" />
												<div>
													<div className="font-medium">{session.thoughts?.length || 0}</div>
													<div className="text-muted-foreground">Thoughts</div>
												</div>
											</div>
											<div className="flex items-center space-x-2">
												<MessageSquare className="w-4 h-4 text-muted-foreground" />
												<div>
													<div className="font-medium">{session.howls?.length || 0}</div>
													<div className="text-muted-foreground">Howls</div>
												</div>
											</div>
											<div className="flex items-center space-x-2">
												<Sparkles className="w-4 h-4 text-muted-foreground" />
												<div>
													<div className="font-medium">{session.toolCalls?.length || 0}</div>
													<div className="text-muted-foreground">Tool Calls</div>
												</div>
											</div>
										</div>
										<Separator className="my-4" />
										<div className="flex justify-end">
											<SessionDialog session={session} />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
