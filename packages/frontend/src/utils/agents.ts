import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const agentsQueryOptions = () =>
	queryOptions({
		queryKey: ["agents"],
		queryFn: async () => {
			const res = await api.agents.$get();
			if (!res.ok) {
				throw new Error(`Failed to fetch agents: ${res.status}`);
			}
			return res.json();
		},
	});

export const agentQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["agents", id],
		queryFn: async () => {
			const res = await api.agents.id[":id"].$get({ param: { id } });
			if (!res.ok) {
				throw new Error(`Failed to fetch agent: ${res.status}`);
			}
			return res.json();
		},
	});

export const agentByUsernameQueryOptions = (username: string) =>
	queryOptions({
		queryKey: ["agents", username],
		queryFn: async () => {
			const res = await api.agents.username[":username"].$get({
				param: { username },
			});
			if (!res.ok) {
				throw new Error(`Failed to fetch agent by username: ${res.status}`);
			}
			return res.json();
		},
	});
