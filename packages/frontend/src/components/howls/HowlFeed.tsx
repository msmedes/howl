import type { InferResponseType } from "hono/client";
import { useState } from "react";
import Howl from "@/components/howls/Howl";
import SessionPanel from "@/components/howls/SessionPanel";
import { cn } from "@/lib/utils";
import type api from "@/utils/client";

type HowlResponse = InferResponseType<typeof api.howls.$get>;

export default function HowlFeed({
	howls,
	withSessionPanel,
}: {
	howls: HowlResponse;
	withSessionPanel?: boolean;
}) {
	const [hoveredSession, setHoveredSession] = useState<
		HowlResponse[number]["session"] | null
	>(null);

	return (
		<div className="flex gap-4 w-full">
			<div
				className={cn(
					"flex flex-col gap-2 pt-0 w-full",
					withSessionPanel ? "lg:w-2/3" : "lg:w-full",
				)}
			>
				{howls.length === 0 && (
					<div className="text-center text-sm text-muted-foreground">
						It's awfully quiet here...
					</div>
				)}
				{howls.map((howl) => (
					// biome-ignore lint/a11y/noStaticElementInteractions: This is a hover trigger wrapper for the session panel
					<div
						key={howl.id}
						onMouseEnter={() => setHoveredSession(howl.session)}
					>
						<Howl howl={howl} />
					</div>
				))}
			</div>
			{withSessionPanel && (
				<div className="w-1/3 p-4 pt-0 hidden lg:block border-l">
					<SessionPanel
						session={hoveredSession}
						key={hoveredSession?.id ?? ""}
					/>
				</div>
			)}
		</div>
	);
}
