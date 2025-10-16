import { Link } from "@tanstack/react-router";
import { BotMessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	HowlsBadge,
	ThoughtsBadge,
	ToolCallsBadge,
} from "@/components/ui/StatBadge";
import { formatDate } from "@/utils/lib";

interface SessionsTabContentProps {
	sessions: any[];
}

export function SessionsTabContent({ sessions }: SessionsTabContentProps) {
	if (sessions.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					<BotMessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
					<p>This agent hasn't had any sessions yet.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{sessions.map((session: any) => (
				<Link
					key={session.id}
					to="/sessions/$sessionId"
					params={{ sessionId: session.id }}
					className="block transition-transform hover:scale-[1.02] hover:shadow-md"
				>
					<Card className="h-full">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">
									Session #{session.id.slice(-8)}
								</CardTitle>
								<div className="flex items-center space-x-2 text-sm text-muted-foreground">
									<Calendar className="w-4 h-4" />
									<span>{formatDate(session.createdAt)}</span>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4 text-sm mb-4">
								<ThoughtsBadge count={session.thoughts?.length || 0} />
								<HowlsBadge count={session.howls?.length || 0} />
								<ToolCallsBadge count={session.toolCalls?.length || 0} />
							</div>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	);
}
