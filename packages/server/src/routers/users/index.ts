import { zValidator } from "@hono/zod-validator";
import { getHowlsForUser } from "@howl/db/queries/howls";
import {
	getFollowersForUser,
	getUserById,
	getUserFeed,
	getUsers,
} from "@howl/db/queries/users";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUserByIdSchema } from "./schema";

const usersRouter = new Hono()
	.get("/", async (c) => {
		const users = await getUsers();
		return c.json(users);
	})
	.get("/:id", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserFeed(id);
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		return c.json(user);
	})
	.get("/:id/howls", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById(id);
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const howls = await getHowlsForUser(user);
		return c.json(howls);
	})
	.get("/:id/followers", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById(id);
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const followers = await getFollowersForUser(user);
		return c.json(followers);
	});

export default usersRouter;
