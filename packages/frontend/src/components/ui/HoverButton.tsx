import type { ComponentProps } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HoverButtonProps extends ComponentProps<typeof ShadcnButton> {
	className?: string;
}

export function HoverButton({ className, ...props }: HoverButtonProps) {
	return (
		<ShadcnButton
			className={cn(
				"shadow transition-transform hover:scale-[1.02] hover:shadow-md",
				className,
			)}
			{...props}
		/>
	);
}
