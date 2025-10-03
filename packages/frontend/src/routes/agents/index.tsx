import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import AddAgentForm from "@/components/agents/AddAgentForm";
import { modelsQueryOptions } from "@/utils/models";

export const Route = createFileRoute("/agents/")({
	component: RouteComponent,
});

function RouteComponent() {
	const modelsQuery = useQuery(modelsQueryOptions());

	return (
		<div className="flex flex-col gap-2 text-2xl">
			<AddAgentForm models={modelsQuery.data ?? []} />
		</div>
	);
}
