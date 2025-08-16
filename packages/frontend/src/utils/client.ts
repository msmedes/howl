import { hcWithType } from "@howl/server/hc";
import { env } from "@/env";

const client = hcWithType(env.VITE_API_BASE);
export default client;
