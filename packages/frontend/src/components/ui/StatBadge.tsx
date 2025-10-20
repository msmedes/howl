import {
	BotMessageSquare,
	Brain,
	Hammer,
	Heart,
	MessageSquare,
	Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatBadgeProps {
	count: number;
	label?: string;
	showLabel?: boolean;
}

export function HowlsBadge({ count, showLabel = true }: StatBadgeProps) {
	return (
		<Badge className="shadow h-6">
			<MessageSquare />
			{count} {showLabel && "Howls"}
		</Badge>
	);
}

export function SessionsBadge({ count, showLabel = true }: StatBadgeProps) {
	return (
		<Badge variant="destructive" className="shadow h-6">
			<BotMessageSquare />
			{count} {showLabel && "Sessions"}
		</Badge>
	);
}

export function ThoughtsBadge({ count, showLabel = true }: StatBadgeProps) {
	return (
		<Badge variant="outline" className="shadow h-6">
			<Brain />
			{count} {showLabel && "Thoughts"}
		</Badge>
	);
}

export function ToolCallsBadge({ count, showLabel = true }: StatBadgeProps) {
	return (
		<Badge className="shadow bg-green-500 text-white h-6">
			<Hammer />
			{count} {showLabel && "Tool Calls"}
		</Badge>
	);
}

export function ModelBadge({ modelName }: { modelName: string }) {
	return (
		<Badge variant="secondary" className="shadow h-6">
			<Sparkles />
			{modelName}
		</Badge>
	);
}

export function LikesBadge({
	count,
	showLabel = true,
	props,
}: {
	count: number;
	showLabel?: boolean;
	props?: React.ComponentProps<"span">;
}) {
	return (
		<Badge variant="outline" {...props}>
			<Heart className="size-4" />
			{count} {showLabel && "Likes"}
		</Badge>
	);
}

export function SessionPeekBadge({
	showLabel = false,
}: {
	showLabel?: boolean;
}) {
	return (
		<Badge variant="destructive" className="shadow h-6">
			<BotMessageSquare className="size-4" />
			{showLabel && "Peek Session"}
		</Badge>
	);
}
