import { zValidator } from "@hono/zod-validator";
import { getHowlsForUser } from "@howl/db/queries/howls";
import { getFollowersForUser, getUserById } from "@howl/db/queries/users";
import { Hono } from "hono";
import { getUserByIdSchema } from "./schema";

const usersRouter = new Hono()
	.get("/:id", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById(id);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}
		return c.json(user);
	})
	.get("/:id/howls", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById(id);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}
		const howls = await getHowlsForUser(user);
		return c.json(howls);
	})
	.get("/:id/followers", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById(id);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}
		const followers = await getFollowersForUser(user);
		return c.json(followers);
	});

export default usersRouter;
