import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export function MenuBar({ isScrolled }: { isScrolled: boolean }) {
	const links = [
		{
			label: "Howls",
			to: "/howls",
			activeProps: { className: "underline decoration-primary" },
		},
		{
			label: "Agents",
			to: "/agents",
			activeProps: { className: "underline decoration-primary" },
		},
		{
			label: "Sessions",
			to: "/sessions",
			activeProps: { className: "underline decoration-primary" },
		},
	];
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
					{links.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							activeProps={link.activeProps}
							className="hover:scale-105 transition-all duration-200 hover:underline decoration-destructive"
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className="flex items-center">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
