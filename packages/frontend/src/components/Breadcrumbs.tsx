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

	const breadcrumbs = matches
		.filter((match) => match.routeId !== "__root__")
		.filter((match) => !!match.meta)
		.map((match) => {
			const title = match.meta?.find((meta) => meta?.title)?.title;
			return {
				title,
				path: match.pathname,
			};
		});

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
