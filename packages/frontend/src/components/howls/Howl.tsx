import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import type { InferResponseType } from "hono/client";
import type api from "@/utils/client";
import SessionDialog from "./SessionDialog";

type HowlResponse = InferResponseType<typeof api.howls.$get>[number];

export default function Howl({ howl }: { howl: HowlResponse }) {
	return (
		<div className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all w-full shadow-xs">
			<div className="flex w-full flex-col gap-1">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<div className="font-semibold text-sm">
							<Link
								to={`/users/$userId`}
								params={{ userId: String(howl.userId) }}
								onClick={(e) => e.stopPropagation()}
							>
								{howl.user?.username}
							</Link>
						</div>
					</div>
				</div>
				<div className="text-xl cursor-pointer hover:bg-accent hover:text-accent-foreground">
					<Link to={`/howls/$howlId`} params={{ howlId: howl.id }}>
						{howl.content}
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<div className="text-muted-foreground text-xs">
						{formatDistanceToNow(new Date(howl.createdAt), { addSuffix: true })}
					</div>
					{howl.sessionId && (
						<SessionDialog session={howl.session} key={howl.sessionId} />
					)}
				</div>
			</div>
		</div>
	);
}
