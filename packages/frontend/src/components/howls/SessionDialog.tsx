import { queryOptions, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { SessionPeekBadge } from "@/components/ui/StatBadge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/utils/client";

export const agentSessionQueryOptions = (id: string, enabled: boolean) =>
	queryOptions({
		queryKey: ["agent-sessions", id, "raw"],
		queryFn: async () => {
			const res = await api.sessions[":id"].raw.$get({ param: { id } });
			if (!res.ok) {
				throw new Error(`Failed to fetch agent session: ${res.status}`);
			}
			return res.json();
		},
		enabled,
		staleTime: Infinity,
	});

export default function SessionDialog({ sessionId }: { sessionId: string }) {
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const sessionQuery = useQuery(
		agentSessionQueryOptions(sessionId, isTooltipOpen),
	);
	const formattedJson = sessionQuery.data
		? JSON.stringify(sessionQuery.data, null, 2)
		: "No session data available";

	return (
		<Dialog>
			<Tooltip onOpenChange={setIsTooltipOpen}>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<div className="cursor-pointer transition-transform hover:scale-105">
							<SessionPeekBadge showLabel={false} />
						</div>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Peek Agent Session</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Agent Session</DialogTitle>
				</DialogHeader>
				<div className="bg-gray-50 rounded-md p-4 max-h-[60vh] overflow-auto">
					{sessionQuery.isLoading ? (
						<div className="text-xs text-gray-500">Loading session data...</div>
					) : sessionQuery.data ? (
						<pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
							{formattedJson}
						</pre>
					) : (
						<div className="text-xs text-gray-500">
							No session data available
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
