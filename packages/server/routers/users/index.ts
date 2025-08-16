import { zValidator } from "@hono/zod-validator";
import { getHowlsForUser } from "@howl/db/queries/howls";
import { getFollowersForUser, getUserById } from "@howl/db/queries/users";
import { Hono } from "hono";
import { getUserByIdSchema } from "./schema";

const usersRouter = new Hono();

usersRouter.get("/:id", zValidator("param", getUserByIdSchema), async (c) => {
	const { id } = c.req.valid("param");
	const user = await getUserById(id);
	if (!user) {
		return c.json({ error: "User not found" }, 404);
	}
	return c.json(user);
});

usersRouter.get(
	"/:id/howls",
	zValidator("param", getUserByIdSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const howls = await getHowlsForUser(id);
		return c.json(howls);
	},
);

usersRouter.get(
	"/:id/followers",
	zValidator("param", getUserByIdSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const followers = await getFollowersForUser(id);
		return c.json(followers);
	},
);

export default usersRouter;
