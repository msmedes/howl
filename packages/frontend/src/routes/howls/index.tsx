import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Howl from "@/components/howls/Howl";
import { howlsQueryOptions } from "@/utils/howls";

export const Route = createFileRoute("/howls/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(howlsQueryOptions());
	},
});

function RouteComponent() {
	const howlsQuery = useQuery(howlsQueryOptions());

	return (
		<div className="mt-8">
			<div className="flex flex-col gap-2 p-4 pt-0 w-1/2 mx-auto">
				{howlsQuery.data?.map((howl) => (
					<Howl howl={howl} key={howl.id} />
				))}
			</div>
			<Outlet />
		</div>
	);
}
