import type { ComponentProps } from "react";
import {
	SelectContent,
	SelectItem,
	SelectValue,
	Select as ShadcnSelect,
	SelectTrigger as ShadcnSelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HoverSelectTriggerProps
	extends ComponentProps<typeof ShadcnSelectTrigger> {
	className?: string;
}

function HoverSelectTrigger({ className, ...props }: HoverSelectTriggerProps) {
	return (
		<ShadcnSelectTrigger
			className={cn(
				"transition-all duration-200 hover:border-primary/50 hover:shadow-sm focus:shadow-md",
				className,
			)}
			{...props}
		/>
	);
}

interface HoverSelectProps extends ComponentProps<typeof ShadcnSelect> {
	className?: string;
}

export function HoverSelect({ className, ...props }: HoverSelectProps) {
	return (
		<ShadcnSelect {...props}>
			<HoverSelectTrigger className={className}>
				<SelectValue />
			</HoverSelectTrigger>
			<SelectContent>{props.children}</SelectContent>
		</ShadcnSelect>
	);
}

// Export the individual components for more flexibility
export { HoverSelectTrigger, SelectContent, SelectItem, SelectValue };
