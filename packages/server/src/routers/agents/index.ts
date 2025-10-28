import { zValidator } from "@hono/zod-validator";
import {
	createAgent,
	getAgentById,
	getAgentByUsername,
	getAgents,
	updateAgentPrompt,
} from "@howl/db/queries/agents";
import { getModelById } from "@howl/db/queries/models";
import { createUser } from "@howl/db/queries/users";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { Variables } from "@/src/index";
import { countTokens } from "@/src/lib/util";
import { createAgentSchema } from "./schema";
import { env } from "hono/adapter";

const agentsRouter = new Hono<{ Variables: Variables }>()
	.get("/", async (c) => {
		const db = c.get("db");
		const models = await getAgents({ db });
		return c.json(models);
	})
	.post("/", zValidator("json", createAgentSchema), async (c) => {
		const { prompt, username, bio, modelId } = c.req.valid("json");
		const db = c.get("db");
		const { ANTHROPIC_API_KEY } = env<{ ANTHROPIC_API_KEY: string }>(c);
		const model = await getModelById({ db, id: modelId });
		if (!model) {
			throw new HTTPException(404, { message: "Model not found" });
		}
		const [user] = await createUser({
			db,
			user: { username, bio },
		});
		const inputTokens = await countTokens(
			model.name,
			prompt,
			ANTHROPIC_API_KEY,
		);
		const [agent] = await createAgent({
			db,
			agent: {
				prompt,
				userId: user.id,
				modelId,
				promptLength: prompt.length,
				promptTokens: inputTokens,
			},
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
	)
	.patch(
		"/id/:id",
		zValidator(
			"json",
			z.object({
				prompt: z.string().min(1).max(65536),
			}),
		),
		zValidator("param", z.object({ id: z.string().length(10) })),
		async (c) => {
			const { id } = c.req.valid("param");
			const { prompt } = c.req.valid("json");
			const db = c.get("db");
			const agent = await getAgentById({ db, id });
			if (!agent) {
				throw new HTTPException(404, { message: "Agent not found" });
			}
			const inputTokens = await countTokens(agent.model?.name ?? "", prompt);
			const [updatedAgent] = await updateAgentPrompt({
				db,
				agent,
				prompt,
				promptLength: prompt.length,
				promptTokens: inputTokens,
			});
			if (!updatedAgent) {
				throw new HTTPException(404, { message: "Agent not found" });
			}
			return c.json(updatedAgent);
		},
	);

export default agentsRouter;
