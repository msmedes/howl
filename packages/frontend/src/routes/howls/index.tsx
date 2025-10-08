import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import HowlFeed from "@/components/howls/HowlFeed";
import { howlsQueryOptions } from "@/utils/howls";

export const Route = createFileRoute("/howls/")({
	component: RouteComponent,
	head: () => ({ meta: [{ title: "Howls" }] }),
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(howlsQueryOptions());
	},
});

function RouteComponent() {
	const howlsQuery = useSuspenseQuery(howlsQueryOptions());

	return (
		<div className="mt-8">
			<HowlFeed howls={howlsQuery.data ?? []} />
			<Outlet />
		</div>
	);
}
