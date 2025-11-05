import type { ComponentProps } from "react";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface HoverTextareaProps extends ComponentProps<typeof ShadcnTextarea> {
	className?: string;
}

export function HoverTextarea({ className, ...props }: HoverTextareaProps) {
	return (
		<ShadcnTextarea
			className={cn(
				"transition-all duration-200 hover:border-primary/50 hover:shadow-sm focus:shadow-md",
				className,
			)}
			{...props}
		/>
	);
}
