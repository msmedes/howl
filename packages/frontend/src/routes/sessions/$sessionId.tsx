import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import { Brain, Wrench } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { agentSessionQueryOptions } from "@/utils/agent-sessions";
import type api from "@/utils/client";
import { camelCaseToTitleCase } from "@/utils/lib";

type SessionResponse = InferResponseType<(typeof api.sessions)[":id"]["$get"]>;
type ToolCall = SessionResponse["toolCalls"][number];
type Thoughts = SessionResponse["thoughts"][number];

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

	function processToolCalls(toolCalls: ToolCall[]) {
		return toolCalls.map((toolCall) => {
			return {
				...toolCall,
				type: "Tool Call",
			};
		});
	}

	function processThoughts(thoughts: Thoughts[]) {
		return thoughts.map((thought) => {
			return {
				...thought,
				type: "Thought",
			};
		});
	}

	const toolCalls = processToolCalls(session.toolCalls);
	const thoughts = processThoughts(session.thoughts);

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
		<Accordion type="single" collapsible>
			{sessionSteps.map((step) => (
				<>
					<AccordionItem value={step.stepNumber.toString()}>
						<AccordionTrigger>
							{step.type === "Tool Call" ? (
								<div className="flex items-center gap-2">
									<Wrench className="size-4" />{" "}
									<span>{camelCaseToTitleCase(step.toolName)}</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Brain className="size-4" /> Thought
								</div>
							)}
						</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-4 text-balance">
							{step.content || JSON.stringify(step.arguments)}
						</AccordionContent>
					</AccordionItem>
				</>
			))}
		</Accordion>
	);
}
