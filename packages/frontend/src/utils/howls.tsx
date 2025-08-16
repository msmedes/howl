import { queryOptions } from "@tanstack/react-query";
import client from "@/utils/client";

export const howlsQueryOptions = () =>
	queryOptions({
		queryKey: ["howls"],
		queryFn: async () => {
			const res = await client.v1.howls.$get();
			return res.json();
		},
	});
