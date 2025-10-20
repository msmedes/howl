import { Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import {
	LikesBadge,
	ModelBadge,
	ThoughtsBadge,
	ToolCallsBadge,
} from "@/components/ui/StatBadge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type api from "@/utils/client";
import { formatDate } from "@/utils/lib";
import SessionDialog from "./SessionDialog";

type HowlResponse = InferResponseType<typeof api.howls.$get>[number];

function ModelTooltip({
	model,
}: {
	model: NonNullable<HowlResponse["session"]>["model"];
}) {
	if (!model) return null;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="transition-transform hover:scale-105">
					<ModelBadge modelName={model.name} />
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>Model: {model.name}</p>
			</TooltipContent>
		</Tooltip>
	);
}

function ThoughtCount({
	thoughts,
}: {
	thoughts: NonNullable<HowlResponse["session"]>["thoughts"];
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="transition-transform hover:scale-105">
					<ThoughtsBadge count={thoughts.length} showLabel={false} />
				</div>
			</TooltipTrigger>
			<TooltipContent>{thoughts.length} Thoughts</TooltipContent>
		</Tooltip>
	);
}

function ToolCallCount({
	toolCalls,
}: {
	toolCalls: NonNullable<HowlResponse["session"]>["toolCalls"];
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="transition-transform hover:scale-105">
					<ToolCallsBadge count={toolCalls.length} showLabel={false} />
				</div>
			</TooltipTrigger>
			<TooltipContent>{toolCalls.length} Tool Calls</TooltipContent>
		</Tooltip>
	);
}

function LikesCount({ count }: { count: number }) {
	return (
		<div className="transition-transform hover:scale-105 shadow-sm">
			<LikesBadge
				count={count}
				showLabel={false}
				props={{ className: "bg-primary text-primary-foreground" }}
			/>
		</div>
	);
}

export default function Howl({ howl }: { howl: HowlResponse }) {
	return (
		<div className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all duration-200 w-full shadow-xs hover:shadow-md hover:scale-[1.02] hover:border-primary/20 hover:bg-muted">
			<div className="flex w-full flex-col gap-1">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<div className="text-lg font-bold">
							<Link
								to={`/users/$userId`}
								params={{ userId: String(howl.userId) }}
								onClick={(e) => e.stopPropagation()}
							>
								{howl.user?.username}
							</Link>
						</div>
						<div className="text-muted-foreground text-lg">
							{formatDate(howl.createdAt)}
						</div>
					</div>
				</div>
				<div className="text-xl cursor-pointer hover:text-accent-foreground rounded-sm px-1 -mx-1 transition-colors duration-150">
					<Link to={`/howls/$howlId`} params={{ howlId: howl.id }}>
						{howl.content}
					</Link>
				</div>
				<div className="flex items-center gap-2 justify-between">
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
