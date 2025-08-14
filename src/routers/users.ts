import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getUserById } from "@/db/queries/users";

const usersRouter = new Hono();

usersRouter.get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.nanoid(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = await getUserById(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  },
);

export default usersRouter;
