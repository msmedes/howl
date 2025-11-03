import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import HowlFeed from "@/components/howls/HowlFeed";
import { howlByIdQueryOptions } from "@/utils/howls";

export const Route = createFileRoute("/howls/$howlId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			howlByIdQueryOptions(params.howlId),
		);
	},
	notFoundComponent: () => {
		return <div>Howl not found</div>;
	},
});

function RouteComponent() {
	const { howlId } = Route.useParams();
	const howlThreadQuery = useSuspenseQuery(howlByIdQueryOptions(howlId));

	const howlThread = howlThreadQuery.data;

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<HowlFeed howls={howlThread ?? []} />
		</div>
	);
}
