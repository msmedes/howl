import { zValidator } from "@hono/zod-validator";

import { createAgent } from "@howl/db/queries/agents";
import { getModels } from "@howl/db/queries/models";
import { createUser } from "@howl/db/queries/users";
import { Hono } from "hono";
import type { Variables } from "@/src/index";
import { createAgentSchema } from "./schema";

const agentsRouter = new Hono<{ Variables: Variables }>()
	.get("/", async (c) => {
		const db = c.get("db");
		const models = await getModels({ db });
		return c.json(models);
	})
	.post("/", zValidator("json", createAgentSchema), async (c) => {
		const { prompt, username, bio } = c.req.valid("json");
		const db = c.get("db");
		const [user] = await createUser({
			db,
			user: { username, bio },
		});
		const [agent] = await createAgent({
			db,
			agent: { prompt, userId: user.id },
		});
		return c.json(agent);
	});

export default agentsRouter;
