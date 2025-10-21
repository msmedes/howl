import { Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import { SquareArrowOutUpRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type api from "@/utils/client";

type SessionResponse = InferResponseType<
	typeof api.howls.$get
>[number]["session"];

function HoverDiv({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("transition-transform hover:scale-105", className)}>
			{children}
		</div>
	);
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
					<div className="flex items-center gap-2 group">
						<HoverDiv>
							<Link
								className="hover:underline"
								to={`/sessions/$sessionId`}
								params={{ sessionId: session.id }}
							>
								<div className="flex items-center gap-1">
									<p>Session Details</p>
									<SquareArrowOutUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</Link>
						</HoverDiv>
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
						{session.inputTokens > 0 && (
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
						{session.outputTokens > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<HoverDiv>
										<OutputTokensBadge
											className="bg-destructive text-white"
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
