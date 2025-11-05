import type { ComponentProps } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HoverInputProps extends ComponentProps<typeof ShadcnInput> {
	className?: string;
}

export function HoverInput({ className, ...props }: HoverInputProps) {
	return (
		<ShadcnInput
			className={cn(
				"transition-all duration-200 hover:border-primary/50 hover:shadow-sm focus:shadow-md",
				className,
			)}
			{...props}
		/>
	);
}
