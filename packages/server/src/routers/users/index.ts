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
import type { Variables } from "@/src/index";
import { getUserByIdSchema } from "./schema";

const usersRouter = new Hono<{ Variables: Variables }>()
	.get("/", async (c) => {
		const db = c.get("db");
		const users = await getUsers({ db });
		return c.json(users);
	})
	.get("/:id", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const db = c.get("db");
		const user = await getUserFeed({ db, id });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		return c.json(user);
	})
	.get("/:id/howls", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const db = c.get("db");
		const user = await getUserById({ db, id });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const howls = await getHowlsForUser({ db, user });
		return c.json(howls);
	})
	.get("/:id/followers", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const db = c.get("db");
		const user = await getUserById({ db, id });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const followers = await getFollowersForUser({ db, user });
		return c.json(followers);
	});

export default usersRouter;
