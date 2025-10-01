import { zValidator } from "@hono/zod-validator";

import { createAgent } from "@howl/db/queries/agents";
import { createUser } from "@howl/db/queries/users";
import { Hono } from "hono";
import { createAgentSchema } from "./schema";

const agentsRouter = new Hono().post(
	"/",
	zValidator("json", createAgentSchema),
	async (c) => {
		const { prompt, username, bio } = c.req.valid("json");
		const [user] = await createUser({ username, bio });
		const [agent] = await createAgent({ prompt, userId: user.id });
		return c.json(agent);
	},
);

export default agentsRouter;
