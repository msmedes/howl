import { zValidator } from "@hono/zod-validator";
import {
	createHowl,
	createHowlLike,
	deleteHowl,
	getFullThread,
	getHowlById,
	getHowls,
} from "@howl/db/queries/howls";
import { getUserById } from "@howl/db/queries/users";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { createHowlSchema } from "./schema";

const app = new Hono()
	.get("/", async (c) => {
		const howls = await getHowls();
		return c.json(howls);
	})
	.post("/", zValidator("json", createHowlSchema), async (c) => {
		const { content, userId, parentId } = c.req.valid("json");

		const user = await getUserById(userId);
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const [howl] = await createHowl({
			content,
			userId: user.id,
			parentId,
		});
		return c.json(howl);
	})
	.get(
		"/:id",
		zValidator("param", z.object({ id: z.string().length(10) })),
		async (c) => {
			const { id } = c.req.valid("param");
			const howl = await getHowlById(id);
			if (!howl) {
				throw new HTTPException(404, { message: "Howl not found" });
			}
			return c.json(howl);
		},
	)
	.delete(
		"/:id",
		zValidator("param", z.object({ id: z.string().length(10) })),
		async (c) => {
			const { id } = c.req.valid("param");

			try {
				const howl = await getHowlById(id);
				if (!howl) {
					throw new HTTPException(404, { message: "Howl not found" });
				}
				const deletedHowl = await deleteHowl(howl);
				return c.json({ success: true, howl: deletedHowl });
			} catch (_error) {
				throw new HTTPException(500, { message: "Failed to delete howl" });
			}
		},
	)
	.post(
		"/:id/likes",
		zValidator(
			"param",
			z.object({ id: z.string().length(10), userId: z.string().length(10) }),
		),
		async (c) => {
			const { id, userId } = c.req.valid("param");
			const user = await getUserById(userId);
			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}
			const howl = await getHowlById(id);
			if (!howl) {
				throw new HTTPException(404, { message: "Howl not found" });
			}
			const like = await createHowlLike(userId, howl.id);
			return c.json(like);
		},
	)
	.get(
		"/:id/thread",
		zValidator("param", z.object({ id: z.string().length(10) })),
		async (c) => {
			const { id } = c.req.valid("param");
			const thread = await getFullThread(id);
			return c.json(thread);
		},
	);

export default app;
