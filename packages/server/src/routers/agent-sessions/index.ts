import { zValidator } from "@hono/zod-validator";
import { getAgentSessionById } from "@howl/db/queries/agent-sessions";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { Variables } from "@/src/index";

const app = new Hono<{ Variables: Variables }>().get(
	"/:id",
	zValidator("param", z.object({ id: z.string().length(10) })),
	async (c) => {
		const { id } = c.req.valid("param");
		const db = c.get("db");
		const session = await getAgentSessionById({ db, id });
		if (!session) {
			throw new HTTPException(404, { message: "Session not found" });
		}
		return c.json(session);
	},
);

export default app;
