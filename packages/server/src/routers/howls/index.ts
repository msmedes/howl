import { zValidator } from "@hono/zod-validator";
import { createHowl, getHowlById, getHowls } from "@howl/db/queries/howls";
import { getUserById } from "@howl/db/queries/users";
import { Hono } from "hono";
import { z } from "zod";
import { createHowlSchema } from "./schema";

const app = new Hono()
	.get("/", async (c) => {
		const howls = await getHowls();
		return c.json(howls);
	})
	.post("/", zValidator("json", createHowlSchema), async (c) => {
		const { content, userId } = c.req.valid("json");
		console.log("lets go");
		const user = await getUserById(userId);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}
		console.log("user", user);
		const howl = await createHowl(content, userId);
		return c.json(howl[0]);
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
