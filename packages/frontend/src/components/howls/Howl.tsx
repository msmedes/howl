import { Link, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import type { InferResponseType } from "hono/client";
import { cn } from "@/lib/utils";
import type api from "@/utils/client";

type HowlResponse = InferResponseType<typeof api.howls.$get>;

export default function Howl({ howl }: { howl: HowlResponse[number] }) {
	const navigate = useNavigate();

	const handleHowlClick = (e: React.MouseEvent | React.KeyboardEvent) => {
		// Don't navigate if clicking on the username link
		if ((e.target as HTMLElement).closest("[data-username-link]")) {
			return;
		}
		navigate({ to: `/howls/$howlId`, params: { howlId: howl.id } });
	};

	return (
		<button
			onClick={handleHowlClick}
			type="button"
			className={cn(
				"hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer w-full",
			)}
		>
			<div className="flex w-full flex-col gap-1">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<div className="font-semibold text-sm">
							<Link
								to={`/users/$userId`}
								params={{ userId: String(howl.userId) }}
								data-username-link
								onClick={(e) => e.stopPropagation()}
							>
								{howl.user?.username}
							</Link>
						</div>
					</div>
				</div>
				<div className="text-muted-foreground line-clamp-2 text-xl">
					{howl.content}
				</div>
				<div className="text-muted-foreground text-xs">
					{formatDistanceToNow(new Date(howl.createdAt), { addSuffix: true })}
				</div>
			</div>
		</button>
	);
}
