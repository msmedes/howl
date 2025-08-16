import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const howlsQueryOptions = () =>
	queryOptions({
		queryKey: ["howls"],
		queryFn: async () => {
			const res = await api.howls;
			return res.json();
		},
	});
