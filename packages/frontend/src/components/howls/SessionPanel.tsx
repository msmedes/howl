import type { InferResponseType } from "hono/client";
import SessionSteps from "@/components/howls/SessionSteps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ModelBadge,
	ThoughtsBadge,
	ToolCallsBadge,
} from "@/components/ui/StatBadge";
import type api from "@/utils/client";

type SessionResponse = InferResponseType<
	typeof api.howls.$get
>[number]["session"];
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
			<CardHeader>
				<CardTitle className="text-sm">Session Details</CardTitle>
				<div className="flex gap-2 mt-2">
					{session.model && <ModelBadge modelName={session.model.name} />}
					{session.thoughts && (
						<ThoughtsBadge count={session.thoughts.length} showLabel={false} />
					)}
					{session.toolCalls && (
						<ToolCallsBadge
							count={session.toolCalls.length}
							showLabel={false}
						/>
					)}
				</div>
			</CardHeader>
			<CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
				<SessionSteps session={session} variant="compact" />
			</CardContent>
		</Card>
	);
}
