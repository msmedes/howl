import type { InferResponseType } from "hono/client";
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
import type client from "@/utils/client";

type SessionResponse = InferResponseType<
	typeof client.howls.$get
>[number]["session"];

export default function SessionDialog({
	session,
}: {
	session: SessionResponse;
}) {
	const formattedJson = session?.rawSessionJson
		? JSON.stringify(session.rawSessionJson, null, 2)
		: "No session data available";

	return (
		<Dialog>
			<Tooltip>
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
					<pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
						{formattedJson}
					</pre>
				</div>
			</DialogContent>
		</Dialog>
	);
}
