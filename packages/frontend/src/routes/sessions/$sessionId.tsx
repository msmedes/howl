import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import type { JSONValue } from "hono/utils/types";
import { Brain, Hammer } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agentSessionQueryOptions } from "@/utils/agent-sessions";
import type api from "@/utils/client";
import { camelCaseToTitleCase } from "@/utils/lib";

type SessionResponse = InferResponseType<(typeof api.sessions)[":id"]["$get"]>;
type ToolCall = SessionResponse["toolCalls"][number];
type Thoughts = SessionResponse["thoughts"][number];

type ToolCallStep = {
	type: "Tool Call";
	stepNumber: number;
	toolName: string;
	arguments: JSONValue;
};

type ThoughtStep = {
	type: "Thought";
	stepNumber: number;
	content: string;
};

type SessionStep = ToolCallStep | ThoughtStep;

export const Route = createFileRoute("/sessions/$sessionId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			agentSessionQueryOptions(params.sessionId),
		);
	},
	notFoundComponent: () => {
		return <div>Session not found</div>;
	},
});

function RouteComponent() {
	const { sessionId } = Route.useParams();
	const sessionQuery = useSuspenseQuery(agentSessionQueryOptions(sessionId));

	const session = sessionQuery.data;

	if (!session) {
		return <div>Session not found</div>;
	}

	function processToolCalls(toolCalls: ToolCall[]): ToolCallStep[] {
		return toolCalls.map((toolCall) => {
			return {
				...toolCall,
				type: "Tool Call",
			};
		});
	}

	function processThoughts(thoughts: Thoughts[]): ThoughtStep[] {
		return thoughts.map((thought) => {
			return {
				...thought,
				type: "Thought",
			};
		});
	}

	const toolCalls = processToolCalls(session.toolCalls);
	const thoughts = processThoughts(session.thoughts);

	const sessionStepsMap = new Map<string, SessionStep[]>();
	thoughts.forEach((thought) => {
		sessionStepsMap.set(thought.stepNumber.toString(), [
			...(sessionStepsMap.get(thought.stepNumber.toString()) || []),
			thought,
		]);
	});
	toolCalls.forEach((toolCall) => {
		sessionStepsMap.set(toolCall.stepNumber.toString(), [
			...(sessionStepsMap.get(toolCall.stepNumber.toString()) || []),
			toolCall,
		]);
	});

	console.log(sessionStepsMap);

	return (
		<div className="flex flex-col gap-4">
			{Array.from(sessionStepsMap.entries()).map(
				([stepNumber, steps], cardIndex) => (
					<Card
						key={`card-${stepNumber}`}
						className={
							cardIndex % 2 === 0
								? "bg-white dark:bg-gray-900"
								: "bg-gray-50 dark:bg-gray-800"
						}
					>
						<CardHeader>
							<CardTitle>Step {stepNumber}</CardTitle>
						</CardHeader>
						<CardContent>
							<Accordion type="multiple">
								{steps.map((step, index) => (
									<AccordionItem
										key={`${stepNumber}-${step.type}-${index}`}
										value={`${stepNumber}-${index}`}
									>
										<AccordionTrigger>
											{step.type === "Tool Call" ? (
												<div className="flex items-center gap-2">
													<Hammer className="size-4" />{" "}
													<span>{camelCaseToTitleCase(step.toolName)}</span>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<Brain className="size-4" /> Thought
												</div>
											)}
										</AccordionTrigger>
										<AccordionContent className="flex flex-col gap-4 text-balance">
											{step.type === "Thought"
												? step.content
												: JSON.stringify(step.arguments)}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</CardContent>
					</Card>
				),
			)}
		</div>
	);
}
