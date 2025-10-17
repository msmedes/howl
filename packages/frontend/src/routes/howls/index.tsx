import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import HowlFeed from "@/components/howls/HowlFeed";
import Wrapper from "@/components/Wrapper";
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
		<Wrapper>
			<HowlFeed howls={howlsQuery.data ?? []} withSessionPanel />
			<Outlet />
		</Wrapper>
	);
}
