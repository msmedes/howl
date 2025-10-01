import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import AddHowlForm from "@/components/howls/AddHowlForm";
import { howlsQueryOptions } from "@/utils/howls";
import Howl from "./-components/Howl";

export const Route = createFileRoute("/howls/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(howlsQueryOptions());
	},
});

function RouteComponent() {
	const howlsQuery = useQuery(howlsQueryOptions());

	return (
		<div>
			<AddHowlForm replying={false} />
			<ul>
				{howlsQuery.data?.map((howl) => (
					<Howl howl={howl} key={howl.id} />
				))}
			</ul>
			<Outlet />
		</div>
	);
}
