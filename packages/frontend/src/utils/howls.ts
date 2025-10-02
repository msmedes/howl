import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const howlsQueryOptions = () =>
	queryOptions({
		queryKey: ["howls"],
		staleTime: 30 * 1000,
		queryFn: async () => {
			const res = await api.howls.$get();
			return res.json();
		},
	});

export const howlByIdQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["howls", id],
		staleTime: 60 * 1000,
		queryFn: async () => {
			const res = await api.howls[":id"].thread.$get({ param: { id } });
			return res.json();
		},
	});
