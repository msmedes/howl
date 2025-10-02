import type { Howl as HowlType } from "@howl/db/schema";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function Howl({ howl }: { howl: HowlType }) {
	return (
		<Link
			to={`/howls/$howlId`}
			params={{ howlId: howl.id }}
			className={cn(
				"hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
			)}
			type="button"
		>
			<div className="flex w-full flex-col gap-1">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<div className="font-semibold text-sm">
							<Link
								to={`/users/$userId`}
								params={{ userId: String(howl.userId) }}
							>
								{howl.user.username}
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
		</Link>
	);
}
