import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/sessions")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
