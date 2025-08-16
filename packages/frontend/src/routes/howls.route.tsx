import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { howlsQueryOptions } from "@/utils/howls";

export const Route = createFileRoute("/howls")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(howlsQueryOptions());
	},
});

function RouteComponent() {
	const howlsQuery = useQuery(howlsQueryOptions());

	return (
		<div>
			{howlsQuery.data.map((howl) => (
				<div key={howl.id}>{howl.content}</div>
			))}
		</div>
	);
}
