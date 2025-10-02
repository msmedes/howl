import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/users")({
	component: RootComponent,
});

function RootComponent() {
	return <Outlet />;
}
