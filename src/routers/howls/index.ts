import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "@/db";
import { createHowl } from "@/db/queries/howls";

const howlsRouter = new Hono();

howlsRouter.get("/", async (c) => {
  const howls = await db.query.howls.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          bio: true,
        },
      },
    },
  });
  return c.json(howls);
});

howlsRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      content: z.string().min(1).max(140),
      userId: z.nanoid(),
    }),
  ),
  async (c) => {
    const { content, userId } = c.req.valid("json");
    const howl = await createHowl(content, userId);
    return c.json(howl[0]);
  },
);

export default howlsRouter;
