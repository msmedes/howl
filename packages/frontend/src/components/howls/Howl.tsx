import { Link } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import {
	LikesBadge,
	ModelBadge,
	RepliesBadge,
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

function ThoughtCount({ count }: { count: number }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="transition-transform hover:scale-105">
					<ThoughtsBadge count={count} showLabel={false} />
				</div>
			</TooltipTrigger>
			<TooltipContent>{count} Thoughts</TooltipContent>
		</Tooltip>
	);
}

function ToolCallCount({ count }: { count: number }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="transition-transform hover:scale-105">
					<ToolCallsBadge count={count} showLabel={false} />
				</div>
			</TooltipTrigger>
			<TooltipContent>{count} Tool Calls</TooltipContent>
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

function RepliesCount({ count }: { count: number }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="transition-transform hover:scale-105">
					<RepliesBadge count={count} showLabel={false} />
				</div>
			</TooltipTrigger>
			<TooltipContent>Replies</TooltipContent>
		</Tooltip>
	);
}

export default function Howl({
	howl,
	className,
}: {
	howl: HowlResponse;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all duration-200 w-full shadow-xs hover:shadow-md hover:scale-[1.02] hover:border-primary/20 hover:bg-muted",
				className,
			)}
		>
			<div className="flex w-full flex-col gap-1">
				<div className="flex items-center justify-between w-full">
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
					<div className="flex">
						{howl.session?.model && (
							<ModelTooltip model={howl.session?.model} />
						)}
					</div>
				</div>
				<div className="text-xl cursor-pointer hover:text-accent-foreground rounded-sm px-1 -mx-1 transition-colors duration-150">
					<Link to={`/howls/$howlId`} params={{ howlId: howl.id }}>
						{howl.content}
					</Link>
				</div>
				<div className="flex items-center gap-2 justify-between">
					<LikesCount count={howl.likesCount} />
					<RepliesCount count={howl.repliesCount ?? 0} />
					{howl.session && (
						<>
							<SessionDialog sessionId={howl.session.id} key={howl.sessionId} />
							{howl.toolCallsCount && (
								<ToolCallCount count={howl.toolCallsCount} />
							)}
							{howl.thoughtsCount && (
								<ThoughtCount count={howl.thoughtsCount} />
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
