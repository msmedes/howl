import type { AppType } from "@howl/server";
import { hc } from "hono/client";
import { env } from "@/env";

const client = hc<AppType>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<AppType>(...args);

const api = hcWithType(env.VITE_API_BASE);

export default api;
