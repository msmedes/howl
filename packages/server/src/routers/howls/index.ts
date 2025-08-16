import { zValidator } from "@hono/zod-validator";
import {
	createHowl,
	createHowlThread,
	getHowlById,
	getHowls,
	getHowlThreads,
} from "@howl/db/queries/howls";
import { getUserById } from "@howl/db/queries/users";
import { Hono } from "hono";
import { z } from "zod";
import { createHowlSchema, createHowlThreadSchema } from "./schema";

const app = new Hono()
	.get("/", async (c) => {
		const howls = await getHowls();
		return c.json(howls);
	})
	.post("/", zValidator("json", createHowlSchema), async (c) => {
		const { content, userId } = c.req.valid("json");
		const howl = await createHowl(content, userId);
		return c.json(howl[0]);
	})
	.post("threads", zValidator("json", createHowlThreadSchema), async (c) => {
		const { content, userId } = c.req.valid("json");
		const user = await getUserById(userId);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}
		const thread = await createHowlThread(content, user);
		return c.json(thread);
	})
	.get("threads", async (c) => {
		const threads = await getHowlThreads();
		return c.json(threads);
	})
	.get(":id", zValidator("param", z.object({ id: z.nanoid() })), async (c) => {
		const { id } = c.req.valid("param");
		const howl = await getHowlById(id);
		if (!howl) {
			return c.json({ error: "Howl not found" }, 404);
		}
		return c.json(howl);
	});

export default app;
