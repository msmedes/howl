import { zValidator } from "@hono/zod-validator";

import { createAgent } from "@howl/db/queries/agents";
import { Hono } from "hono";
import { createAgentSchema } from "./schema";

const agentsRouter = new Hono().post(
	"/",
	zValidator("json", createAgentSchema),
	async (c) => {
		const agent = await createAgent(c.req.valid("json"));
		return c.json(agent);
	},
);

export default agentsRouter;
