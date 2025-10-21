import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const agentSessionQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["agent-sessions", id],
		queryFn: async () => {
			const res = await api.sessions[":id"].$get({ param: { id } });
			return res.json();
		},
	});

export const agentSessionsQueryOptions = queryOptions({
	queryKey: ["agent-sessions"],
	queryFn: async () => {
		const res = await api.sessions.$get();
		return res.json();
	},
});
