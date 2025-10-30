import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/stream/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [events, setEvents] = useState<
		{ type: string; data: unknown; ts: number }[]
	>([]);
	const esRef = useRef<EventSource | null>(null);
	const doneRef = useRef(false);
	const [connected, setConnected] = useState(false);

	const startStream = () => {
		if (esRef.current) return; // already running
		doneRef.current = false;
		const es = new EventSource("http://localhost:3001/agents/stream");
		esRef.current = es;

		const add = (type: string) => (ev: MessageEvent) => {
			let data: unknown = ev.data;
			try {
				data = JSON.parse(ev.data);
			} catch {}
			setEvents((x) => [...x, { type, data, ts: Date.now() }]);
		};

		es.addEventListener("connected", (e) => {
			setConnected(true);
			add("connected")(e as MessageEvent);
		});
		es.addEventListener("ping", add("ping"));
		es.addEventListener("session-started", add("session-started"));
		es.addEventListener("step-started", add("step-started"));
		es.addEventListener("tool-call", add("tool-call"));
		es.addEventListener("tool-result", add("tool-result"));
		es.addEventListener("session-completed", (e) => {
			add("session-completed")(e as MessageEvent);
			doneRef.current = true;
			setConnected(false);
			es.close();
			esRef.current = null;
		});
		es.addEventListener("session-error", (e) => {
			add("session-error")(e as MessageEvent);
			doneRef.current = true;
			setConnected(false);
			es.close();
			esRef.current = null;
		});

		es.onerror = () => {
			if (!doneRef.current) {
				setConnected(false);
				es.close();
				esRef.current = null;
			}
		};
	};

	const stopStream = () => {
		doneRef.current = true;
		esRef.current?.close();
		esRef.current = null;
		setConnected(false);
	};

	useEffect(() => {
		return () => {
			esRef.current?.close();
			esRef.current = null;
		};
	}, []);

	return (
		<div className="font-mono text-sm space-y-1">
			<div className="flex gap-2 mb-2">
				<button
					className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-60"
					type="button"
					onClick={startStream}
					disabled={!!esRef.current}
				>
					{connected ? "Streaming…" : "Start Stream"}
				</button>
				<button
					className="px-3 py-1 rounded bg-gray-200 text-gray-900 disabled:opacity-60"
					type="button"
					onClick={stopStream}
					disabled={!esRef.current}
				>
					Stop
				</button>
			</div>
			{events.map((event) => (
				<p key={crypto.randomUUID()}>
					{event.type}{" "}
					{typeof event.data === "string"
						? event.data
						: JSON.stringify(event.data)}
				</p>
			))}
		</div>
	);
}
