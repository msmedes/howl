import { zValidator } from "@hono/zod-validator";
import {
	createAgent,
	getAgentById,
	getAgentByUsername,
	getAgents,
} from "@howl/db/queries/agents";
import { getModelById } from "@howl/db/queries/models";
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
		const { prompt, username, bio, modelId } = c.req.valid("json");
		const db = c.get("db");
		const model = await getModelById({ db, id: modelId });
		if (!model) {
			throw new HTTPException(404, { message: "Model not found" });
		}
		const [user] = await createUser({
			db,
			user: { username, bio },
		});
		const [agent] = await createAgent({
			db,
			agent: { prompt, userId: user.id, modelId },
		});
		return c.json(agent);
	})
	.get(
		"/id/:id",
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
	)
	.get(
		"/username/:username",
		zValidator("param", z.object({ username: z.string().min(1).max(48) })),
		async (c) => {
			const { username } = c.req.valid("param");
			const db = c.get("db");
			const agent = await getAgentByUsername({ db, username });
			if (!agent) {
				throw new HTTPException(404, { message: "Agent not found" });
			}
			return c.json(agent);
		},
	);

export default agentsRouter;
