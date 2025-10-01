import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Howl from "@/components/howls/Howl";
import { howlByIdQueryOptions } from "@/utils/howls";

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
		<ul className="">
			{howlThread.map((howl) => (
				<li
					className="border border-gray-200 rounded-lg p-4 mb-4"
					key={howl.id}
				>
					<Howl howl={howl} />
				</li>
			))}
		</ul>
	);
}
