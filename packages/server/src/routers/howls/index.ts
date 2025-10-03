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
import type { Variables } from "@/src/index";
import { createHowlSchema } from "./schema";

const app = new Hono<{ Variables: Variables }>()
	.get("/", async (c) => {
		const db = c.get("db");
		const howls = await getHowls({ db });
		return c.json(howls);
	})
	.post("/", zValidator("json", createHowlSchema), async (c) => {
		const { content, userId, parentId } = c.req.valid("json");
		const db = c.get("db");
		const user = await getUserById({ db, id: userId });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const [howl] = await createHowl({
			db,
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
			const db = c.get("db");
			const howl = await getHowlById({ db, id });
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
			const db = c.get("db");
			try {
				const howl = await getHowlById({ db, id });
				if (!howl) {
					throw new HTTPException(404, { message: "Howl not found" });
				}
				const deletedHowl = await deleteHowl({ db, howl });
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
			const db = c.get("db");
			const user = await getUserById({ db, id: userId });
			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}
			const howl = await getHowlById({ db, id });
			if (!howl) {
				throw new HTTPException(404, { message: "Howl not found" });
			}
			const like = await createHowlLike({ db, userId, howlId: howl.id });
			return c.json(like);
		},
	)
	.get(
		"/:id/thread",
		zValidator("param", z.object({ id: z.string().length(10) })),
		async (c) => {
			const { id } = c.req.valid("param");
			const db = c.get("db");
			const thread = await getFullThread({ db, rootHowlId: id });
			return c.json(thread);
		},
	);

export default app;
