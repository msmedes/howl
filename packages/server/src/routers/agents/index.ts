import { zValidator } from "@hono/zod-validator";
import { createAgent, getAgentById, getAgents } from "@howl/db/queries/agents";
import { createUser } from "@howl/db/queries/users";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { Variables } from "@/src/index";
import { createAgentSchema } from "./schema";

const agentsRouter = new Hono<{ Variables: Variables }>()
	.get("/", async (c) => {
		const db = c.get("db");
		const models = await getAgents({ db });
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
	})
	.get(
		"/:id",
		zValidator("param", z.object({ id: z.string().length(10) })),
		async (c) => {
			const { id } = c.req.valid("param");
			const db = c.get("db");
			const agent = await getAgentById({ db, id });
			if (!agent) {
				throw new HTTPException(404, { message: "Agent not found" });
			}
			return c.json(agent);
		},
	);

export default agentsRouter;
