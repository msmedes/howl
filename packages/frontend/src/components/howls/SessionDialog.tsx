import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function SessionDialog({ session }: { session: any }) {
	const formattedJson = session?.rawSessionJson
		? JSON.stringify(session.rawSessionJson, null, 2)
		: "No session data available";

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Brain className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh]">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">Agent Session</h3>
					<div className="bg-gray-50 rounded-md p-4 max-h-[60vh] overflow-auto">
						<pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
							{formattedJson}
						</pre>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
