import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { howlByIdQueryOptions } from "@/utils/howls";
import Howl from "./-components/Howl";

export const Route = createFileRoute("/howls/$howlId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			howlByIdQueryOptions(params.howlId),
		);
	},
});

function RouteComponent() {
	const { howlId } = Route.useParams();
	const howlThreadQuery = useQuery(howlByIdQueryOptions(howlId));

	if (howlThreadQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (howlThreadQuery.isError || !howlThreadQuery.data) {
		return <div>Howl not found</div>;
	}

	const howlThread = howlThreadQuery.data;

	return (
		<div className="border border-gray-200 rounded-lg p-4 mb-4">
			{howlThread.map((howl) => (
				<Howl howl={howl} key={howl.id} />
			))}
		</div>
	);
}
