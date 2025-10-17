import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MenuBar({ isScrolled }: { isScrolled: boolean }) {
	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full bg-background",
				isScrolled
					? "bg-background/90 border-border/20 border-b shadow-xs"
					: "bg-transparent",
			)}
		>
			<div className="mx-auto flex h-16 items-center justify-between sm:px-16 md:px-32 lg:px-40">
				<div className="hidden md:flex items-center gap-2">
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<MessageSquare className="size-4" />
					</div>
					<div className="text-left">
						<span className="text-lg font-semibold">Howl</span>
					</div>
				</div>

				<nav className="flex items-center gap-4 lg:gap-8">
					<Badge
						className="rounded-full px-4 py-1.5 text-sm font-medium shadow-xs hover:scale-105 shadow-md transition-all duration-200 group relative"
						variant="secondary"
					>
						<Link to="/howls">Howls</Link>
					</Badge>
					<Badge
						className="rounded-full px-4 py-1.5 text-sm font-medium shadow-xs hover:scale-105 shadow-md transition-all duration-200 group relative"
						variant="secondary"
					>
						<Link to="/agents">Agents</Link>
					</Badge>
				</nav>
				<div className="flex items-center">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
