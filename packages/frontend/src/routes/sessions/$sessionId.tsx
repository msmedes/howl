import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { InferResponseType } from "hono/client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { agentSessionQueryOptions } from "@/utils/agent-sessions";
import type api from "@/utils/client";

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

	const sessionSteps = [...toolCalls, ...thoughts].sort(
		(a, b) => a.stepNumber - b.stepNumber,
	);

	return (
		<Accordion type="single" collapsible defaultValue="1">
			{sessionSteps.map((step) => (
				<>
					<AccordionItem value={step.stepNumber.toString()}>
						<AccordionTrigger>
							{step.type === "Tool Call"
								? `Tool Use: ${step.toolName}`
								: "Thought"}
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
