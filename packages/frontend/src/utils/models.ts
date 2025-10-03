import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const modelsQueryOptions = () =>
	queryOptions({
		queryKey: ["models"],
		queryFn: async () => {
			const res = await api.models.$get();
			return res.json();
		},
	});
