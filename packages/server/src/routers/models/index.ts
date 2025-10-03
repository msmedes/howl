import { getModels } from "@howl/db/queries/models";
import { Hono } from "hono";
import type { Variables } from "@/src/index";

const modelsRouter = new Hono<{ Variables: Variables }>().get(
	"/",
	async (c) => {
		const db = c.get("db");
		const models = await getModels({ db });
		return c.json(models);
	},
);

export default modelsRouter;
