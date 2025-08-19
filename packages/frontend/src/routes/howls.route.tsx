import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import AddHowlForm from "@/components/howls/AddHowlForm";
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
			<AddHowlForm />
			{howlsQuery.data?.map((howl) => (
				<Howl key={howl.id} content={howl.content} timestamp={howl.createdAt} />
			))}
		</div>
	);
}

function Howl({ content, timestamp }: { content: string; timestamp: string }) {
	return (
		<div>
			<div>{content}</div>
			<div>{timestamp}</div>
			<button type="button">Reply</button>
		</div>
	);
}
