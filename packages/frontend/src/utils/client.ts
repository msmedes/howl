import type { AppType } from "@howl/server";
import { hc } from "hono/client";
import { env } from "@/env";

const client = hc<AppType>(env.VITE_API_BASE);
export default client;
