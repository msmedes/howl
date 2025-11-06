import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/up")({
	component: UpComponent,
});

function UpComponent() {
	return <div>OK</div>;
}

