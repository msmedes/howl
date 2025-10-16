import type { InferResponseType } from "hono/client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ModelBadge,
	ThoughtsBadge,
	ToolCallsBadge,
} from "@/components/ui/StatBadge";
import type api from "@/utils/client";
import { generateRandomString } from "@/utils/lib";

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

	const toolCalls = (session.toolCalls || []).map((toolCall) => ({
		...toolCall,
		type: "Tool Call" as const,
	}));

	const thoughts = (session.thoughts || []).map((thought) => ({
		...thought,
		type: "Thought" as const,
	}));

	const sessionSteps = [...toolCalls, ...thoughts].sort((a, b) => {
		if (a.stepNumber !== b.stepNumber) {
			return a.stepNumber - b.stepNumber;
		}
		if (a.type === "Thought" && b.type === "Tool Call") {
			return -1;
		}
		if (a.type === "Tool Call" && b.type === "Thought") {
			return 1;
		}
		return 0;
	});

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
				{sessionSteps.length > 0 ? (
					<Accordion type="single" collapsible>
						{sessionSteps.map((step, index) => (
							<AccordionItem
								key={generateRandomString(6)}
								value={index.toString()}
							>
								<AccordionTrigger className="text-sm">
									{step.type === "Tool Call" ? `${step.toolName}` : "Thought"}
								</AccordionTrigger>
								<AccordionContent className="flex flex-col gap-4 text-sm text-muted-foreground">
									{"content" in step && step.content ? (
										<div className="whitespace-pre-wrap">{step.content}</div>
									) : (
										<pre className="text-xs overflow-x-auto">
											{"arguments" in step &&
												JSON.stringify(step.arguments, null, 2)}
										</pre>
									)}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				) : (
					<p className="text-sm text-muted-foreground text-center py-4">
						No session steps available
					</p>
				)}
			</CardContent>
		</Card>
	);
}
