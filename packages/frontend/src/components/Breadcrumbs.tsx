import { useMatches } from "@tanstack/react-router";
import * as React from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs() {
	const matches = useMatches();

	console.log("matches", matches);
	// Filter out the root route and get meaningful breadcrumbs
	const breadcrumbs = matches
		.filter((match) => match.routeId !== "__root__")
		.filter((match) => !!match.meta)
		.map((match) => {
			console.log("match??", match);
			// Try to get title from meta, fallback to route ID
			const title = match.meta?.find((meta) => meta?.title)?.title;
			return {
				title,
				path: match.pathname,
			};
		});
	console.log(breadcrumbs);

	if (breadcrumbs.length === 0) {
		return null;
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map((breadcrumb, index) => {
					return (
						<React.Fragment key={`${breadcrumb.title}-${index}`}>
							<BreadcrumbItem>
								<BreadcrumbLink href={breadcrumb.path}>
									{breadcrumb.title}
								</BreadcrumbLink>
							</BreadcrumbItem>
							{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
