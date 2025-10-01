import { createFileRoute } from "@tanstack/react-router";
import AddAgentForm from "@/components/agents/AddAgentForm";

export const Route = createFileRoute("/agents/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col gap-2 text-2xl">
			<AddAgentForm />
		</div>
	);
}
