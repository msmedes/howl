import { queryOptions } from "@tanstack/react-query";
import api from "@/utils/client";

export const usersQueryOptions = () =>
	queryOptions({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await api.users.$get();
			if (!res.ok) {
				throw new Error(`Failed to fetch users: ${res.status}`);
			}
			return res.json();
		},
	});

export const userQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["users", id],
		queryFn: async () => {
			const res = await api.users[":id"].$get({
				param: { id },
			});
			if (!res.ok) {
				throw new Error(`Failed to fetch user: ${res.status}`);
			}
			return res.json();
		},
	});
