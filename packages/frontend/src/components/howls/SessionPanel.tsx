import type { InferResponseType } from "hono/client";
import SessionSteps from "@/components/howls/SessionSteps";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	InputTokensBadge,
	ModelBadge,
	OutputTokensBadge,
	ThoughtsBadge,
	ToolCallsBadge,
} from "@/components/ui/StatBadge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type api from "@/utils/client";

type SessionResponse = InferResponseType<
	typeof api.howls.$get
>[number]["session"];

function HoverDiv({ children }: { children: React.ReactNode }) {
	return <div className="transition-transform hover:scale-105">{children}</div>;
}
export default function SessionPanel({
	session,
}: {
	session: SessionResponse | null;
}) {
	if (!session) {
		return (
			<Card className="sticky top-4 h-fit hidden lg:block">
				<CardHeader>
					<CardTitle className="text-sm">Session Details</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						Hover over a howl to see its session details
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="sticky top-4 h-fit hidden lg:block">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">
					<div className="flex items-center gap-2">
						<span>Session Details</span>
						<div className="flex items-center gap-2 ml-auto">
							{session.model && (
								<HoverDiv>
									<ModelBadge modelName={session.model.name} />
								</HoverDiv>
							)}
						</div>
					</div>
				</CardTitle>
				<CardDescription>
					<div className="flex gap-2 mt-2 justify-between">
						{session.inputTokens && (
							<Tooltip>
								<TooltipTrigger asChild>
									<HoverDiv>
										<InputTokensBadge
											className="bg-primary text-white"
											count={session.inputTokens}
											showLabel={false}
										/>
									</HoverDiv>
								</TooltipTrigger>
								<TooltipContent>
									<p>Input Tokens</p>
								</TooltipContent>
							</Tooltip>
						)}
						{session.outputTokens && (
							<Tooltip>
								<TooltipTrigger asChild>
									<HoverDiv>
										<OutputTokensBadge
											count={session.outputTokens}
											showLabel={false}
										/>
									</HoverDiv>
								</TooltipTrigger>
								<TooltipContent>
									<p>Output Tokens</p>
								</TooltipContent>
							</Tooltip>
						)}
						{session.thoughts && (
							<Tooltip>
								<TooltipTrigger asChild>
									<HoverDiv>
										<ThoughtsBadge
											count={session.thoughts.length}
											showLabel={false}
										/>
									</HoverDiv>
								</TooltipTrigger>
								<TooltipContent>
									<p>Thoughts</p>
								</TooltipContent>
							</Tooltip>
						)}
						{session.toolCalls && (
							<HoverDiv>
								<ToolCallsBadge
									count={session.toolCalls.length}
									showLabel={false}
								/>
							</HoverDiv>
						)}
					</div>
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
				<SessionSteps session={session} variant="compact" />
			</CardContent>
		</Card>
	);
}
