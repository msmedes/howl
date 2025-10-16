import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import type { InferResponseType } from "hono/client";
import { Brain, Hammer, Heart, Sparkles } from "lucide-react";
import { HoverButton } from "@/components/ui/HoverButton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type api from "@/utils/client";
import SessionDialog from "./SessionDialog";

type HowlResponse = InferResponseType<typeof api.howls.$get>[number];

function ModelTooltip({ model }: { model: HowlResponse["session"]["model"] }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<HoverButton size="icon" variant="secondary" className="shadow-none">
					<Sparkles className="size-4" />
				</HoverButton>
			</TooltipTrigger>
			<TooltipContent>
				<p>{model.name}</p>
			</TooltipContent>
		</Tooltip>
	);
}

function ThoughtCount({
	thoughts,
}: {
	thoughts: HowlResponse["session"]["thoughts"];
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<HoverButton variant="default" className="shadow-none">
					<Brain className="size-4" />
					{thoughts.length}
				</HoverButton>
			</TooltipTrigger>
			<TooltipContent>{thoughts.length} Thoughts</TooltipContent>
		</Tooltip>
	);
}

function ToolCallCount({
	toolCalls,
}: {
	toolCalls: HowlResponse["session"]["toolCalls"];
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<HoverButton className="shadow-none bg-green-500 hover:bg-green-600 text-white">
					<Hammer className="size-4" />
					{toolCalls.length}
				</HoverButton>
			</TooltipTrigger>
			<TooltipContent>{toolCalls.length} Tool Calls</TooltipContent>
		</Tooltip>
	);
}

function LikesCount({ count }: { count: number }) {
	return (
		<HoverButton className="shadow-none">
			<Heart className="size-4" />
			{count}
		</HoverButton>
	);
}

export default function Howl({ howl }: { howl: HowlResponse }) {
	return (
		<div className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all duration-200 w-full shadow-xs hover:shadow-md hover:scale-[1.01] hover:border-primary/20 hover:bg-muted">
			<div className="flex w-full flex-col gap-1">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<div className="text-sm">
							<Link
								to={`/users/$userId`}
								params={{ userId: String(howl.userId) }}
								onClick={(e) => e.stopPropagation()}
							>
								{howl.user?.username}
							</Link>
						</div>
					</div>
				</div>
				<div className="text-xl cursor-pointer hover:text-accent-foreground rounded-sm px-1 -mx-1 transition-colors duration-150">
					<Link to={`/howls/$howlId`} params={{ howlId: howl.id }}>
						{howl.content}
					</Link>
				</div>
				<div className="flex items-center gap-2 justify-between">
					<div className="text-muted-foreground text-xs">
						{formatDistanceToNow(new Date(howl.createdAt), { addSuffix: true })}
					</div>
					<LikesCount count={howl.likesCount} />
					{howl.session && (
						<>
							<SessionDialog session={howl.session} key={howl.sessionId} />
							{howl.session.model && (
								<ModelTooltip model={howl.session.model} />
							)}
							{howl.session.toolCalls && (
								<ToolCallCount toolCalls={howl.session.toolCalls} />
							)}
							{howl.session.thoughts && (
								<ThoughtCount thoughts={howl.session.thoughts} />
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
