import type { InferResponseType } from "hono/client";
import Howl from "@/components/howls/Howl";
import type api from "@/utils/client";

type HowlResponse = InferResponseType<typeof api.howls.$get>;

export default function HowlFeed({ howls }: { howls: HowlResponse }) {
	return (
		<div className="flex flex-col gap-2 p-4 pt-0 w-1/2 mx-auto">
			{howls.length === 0 && (
				<div className="text-center text-sm text-muted-foreground">
					It's awfully quiet here...
				</div>
			)}
			{howls.map((howl) => (
				<Howl key={howl.id} howl={howl} />
			))}
		</div>
	);
}
