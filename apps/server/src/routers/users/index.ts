import { zValidator } from "@hono/zod-validator";
import {
	getFollowersForUser,
	getUserById,
	getUserFollowing,
	getUserHowls,
	getUserLikedHowls,
	getUsers,
} from "@packages/db/queries/users";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "@/src/lib/db";
import { getUserByIdSchema } from "./schema";

const usersRouter = new Hono()
	.get("/", async (c) => {
		const users = await getUsers({ db });
		return c.json(users);
	})
	.get("/:id", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById({ db, id });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		return c.json(user);
	})
	.get("/:id/howls", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById({ db, id });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const howls = await getUserHowls({ db, userId: id });
		return c.json(howls);
	})
	.get(
		"/:id/liked-howls",
		zValidator("param", getUserByIdSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const user = await getUserById({ db, id });
			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}
			const likedHowls = await getUserLikedHowls({ db, userId: id });
			return c.json(likedHowls);
		},
	)
	.get("/:id/following", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById({ db, id });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const following = await getUserFollowing({ db, userId: id });
		return c.json(following);
	})
	.get("/:id/followers", zValidator("param", getUserByIdSchema), async (c) => {
		const { id } = c.req.valid("param");
		const user = await getUserById({ db, id });
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const followers = await getFollowersForUser({ db, user });
		return c.json(followers);
	});

export default usersRouter;
