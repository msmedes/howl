import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {z} from "zod";
import { createHowl, getHowlById, getHowls, createHowlThread, getHowlThreads } from "@/db/queries/howls";
import { createHowlSchema, createHowlThreadSchema } from "./schema";

const howlsRouter = new Hono();

howlsRouter.get("/", async (c) => {
  const howls = await getHowls();
  return c.json(howls);
});

howlsRouter.post("/", zValidator("json", createHowlSchema), async (c) => {
  const { content, userId } = c.req.valid("json");
  const howl = await createHowl(content, userId);
  return c.json(howl[0]);
});

howlsRouter.post("/threads", zValidator("json", createHowlThreadSchema), async (c) => {
  const { content, userId } = c.req.valid("json");
  const thread = await createHowlThread(content, userId);
  return c.json(thread);
});

howlsRouter.get("/threads", async (c) => {
  const threads = await getHowlThreads();
  return c.json(threads);
});

howlsRouter.get(
  "/:id",
  zValidator("param", z.object({ id: z.nanoid()})),
  async (c) => {
    const { id } = c.req.valid("param");
    const howl = await getHowlById(id);
    if (!howl) {
      return c.json({ error: "Howl not found" }, 404);
    }
    return c.json(howl);
  },
);


export default howlsRouter;
