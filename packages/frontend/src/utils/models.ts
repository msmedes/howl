import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const modelsQueryOptions = () =>
	queryOptions({
		queryKey: ["models"],
		queryFn: async () => {
			const res = await api.models.$get();
			if (!res.ok) {
				throw new Error(`Failed to fetch models: ${res.status}`);
			}
			return res.json();
		},
	});
