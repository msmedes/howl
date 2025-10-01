import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/howls")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
