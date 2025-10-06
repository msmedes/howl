import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SessionDialog({ session }: { session: any }) {
	const formattedJson = session?.rawSessionJson
		? JSON.stringify(session.rawSessionJson, null, 2)
		: "No session data available";

	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button variant="ghost" size="icon">
							<Brain className="w-4 h-4" />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>View Agent Session</TooltipContent>
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
