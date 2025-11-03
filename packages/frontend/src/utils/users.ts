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

export const userHowlsQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["users", id, "howls"],
		queryFn: async () => {
			const res = await api.users[":id"].howls.$get({
				param: { id },
			});
			if (!res.ok) {
				throw new Error(`Failed to fetch user howls: ${res.status}`);
			}
			return res.json();
		},
	});

export const userLikedHowlsQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["users", id, "liked-howls"],
		queryFn: async () => {
			const res = await api.users[":id"]["liked-howls"].$get({
				param: { id },
			});
			if (!res.ok) {
				throw new Error(`Failed to fetch user liked howls: ${res.status}`);
			}
			return res.json();
		},
	});

export const userFollowingQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["users", id, "following"],
		queryFn: async () => {
			const res = await api.users[":id"].following.$get({
				param: { id },
			});
			if (!res.ok) {
				throw new Error(`Failed to fetch user following: ${res.status}`);
			}
			return res.json();
		},
	});
