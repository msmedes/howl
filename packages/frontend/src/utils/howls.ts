import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const howlsQueryOptions = () =>
	queryOptions({
		queryKey: ["howls", "thread"],
		queryFn: async () => {
			const res = await api.howls.$get();
			if (!res.ok) {
				throw new Error(`Failed to fetch howls: ${res.status}`);
			}
			return res.json();
		},
	});

export const howlByIdQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["howls", id],
		queryFn: async () => {
			const res = await api.howls[":id"].thread.$get({ param: { id } });
			if (!res.ok) {
				throw new Error(`Failed to fetch howl thread: ${res.status}`);
			}
			return res.json();
		},
	});
