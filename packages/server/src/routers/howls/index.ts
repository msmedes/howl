import { zValidator } from "@hono/zod-validator";
import {
	createHowl,
	deleteHowl,
	getHowlById,
	getHowls,
} from "@howl/db/queries/howls";
import { getUserById, getUserByName } from "@howl/db/queries/users";
import { Hono } from "hono";
import { z } from "zod";
import { createHowlSchema } from "./schema";

const app = new Hono()
	.get("/", async (c) => {
		const howls = await getHowls();
		return c.json(howls);
	})
	.post("/", zValidator("json", createHowlSchema), async (c) => {
		const { content, userId, parentId } = c.req.valid("json");
		let user = await getUserById(userId);
		if (!user) {
			user = await getUserByName("admin");
		}
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}
		const howl = await createHowl({
			content,
			userId: user.id,
			parentId,
		});
		return c.json(howl[0]);
	})
	.get(":id", zValidator("param", z.object({ id: z.nanoid() })), async (c) => {
		const { id } = c.req.valid("param");
		const howl = await getHowlById(id);
		if (!howl) {
			return c.json({ error: "Howl not found" }, 404);
		}
		return c.json(howl);
	})
	.delete(
		":id",
		zValidator("param", z.object({ id: z.nanoid() })),
		async (c) => {
			const { id } = c.req.valid("param");

			try {
				const howl = await getHowlById(id);
				if (!howl) {
					return c.json({ error: "Howl not found" }, 404);
				}
				console.log("deleting howl", howl);
				const deletedHowl = await deleteHowl(howl);
				return c.json({ success: true, howl: deletedHowl });
			} catch (error) {
				console.error("Failed to delete howl:", error);
				return c.json({ error: "Failed to delete howl" }, 500);
			}
		},
	);

export default app;
