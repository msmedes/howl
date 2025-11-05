import { getModels } from "@packages/db/queries/models";
import { Hono } from "hono";
import { db } from "@/src/lib/db";

const modelsRouter = new Hono().get("/", async (c) => {
	const models = await getModels({ db });
	return c.json(models);
});

export default modelsRouter;
