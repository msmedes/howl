import {
	BotMessageSquare,
	Brain,
	Hammer,
	Heart,
	MessageSquare,
	MoveDownRight,
	MoveUpRight,
	Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatBadgeProps {
	count: number;
	label?: string;
	showLabel?: boolean;
	className?: string;
}

export function HowlsBadge({
	count,
	showLabel = true,
	className,
}: StatBadgeProps) {
	return (
		<Badge className={cn("shadow h-6", className)}>
			<MessageSquare />
			{count} {showLabel && "Howls"}
		</Badge>
	);
}

export function SessionsBadge({
	count,
	showLabel = true,
	className,
}: StatBadgeProps) {
	return (
		<Badge variant="destructive" className={cn("shadow h-6", className)}>
			<BotMessageSquare />
			{count} {showLabel && "Sessions"}
		</Badge>
	);
}

export function ThoughtsBadge({
	count,
	showLabel = true,
	className,
}: StatBadgeProps) {
	return (
		<Badge variant="outline" className={cn("shadow h-6", className)}>
			<Brain />
			{count} {showLabel && "Thoughts"}
		</Badge>
	);
}

export function ToolCallsBadge({
	count,
	showLabel = true,
	className,
}: StatBadgeProps) {
	return (
		<Badge className={cn("shadow bg-green-500 text-white h-6", className)}>
			<Hammer />
			{count} {showLabel && "Tool Calls"}
		</Badge>
	);
}

export function ModelBadge({
	modelName,
	className,
}: {
	modelName: string;
	className?: string;
}) {
	return (
		<Badge variant="secondary" className={cn("shadow h-6", className)}>
			<Sparkles />
			{modelName}
		</Badge>
	);
}

export function LikesBadge({
	count,
	showLabel = true,
	props,
	className,
}: {
	count: number;
	showLabel?: boolean;
	props?: React.ComponentProps<"span">;
	className?: string;
}) {
	return (
		<Badge
			variant="outline"
			{...props}
			className={cn("shadow h-6 bg-primary text-white", className)}
		>
			<Heart className="size-4" />
			{count} {showLabel && "Likes"}
		</Badge>
	);
}

export function SessionPeekBadge({
	showLabel = false,
	className,
}: StatBadgeProps) {
	return (
		<Badge variant="destructive" className={cn("shadow h-6", className)}>
			<BotMessageSquare className="size-4" />
			{showLabel && "Peek Session"}
		</Badge>
	);
}

export function InputTokensBadge({
	count,
	showLabel = true,
	className,
}: StatBadgeProps) {
	return (
		<Badge variant="outline" className={cn("shadow h-6", className)}>
			<MoveUpRight />
			{count} {showLabel && "Input Tokens"}
		</Badge>
	);
}

export function OutputTokensBadge({
	count,
	showLabel = true,
	className,
}: StatBadgeProps) {
	return (
		<Badge variant="outline" className={cn("shadow h-6", className)}>
			<MoveDownRight />
			{count} {showLabel && "Output Tokens"}
		</Badge>
	);
}
