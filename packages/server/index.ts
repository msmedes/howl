import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import howlsRouter from "@/routers/howls";
import usersRouter from "@/routers/users";

const app = new Hono()
	.basePath("/v1")
	.use(logger())
	.use(
		cors({
			origin: [
				"http://localhost:3000",
				"http://localhost:3001",
				"http://127.0.0.1:3000",
				"http://127.0.0.1:3001",
			],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.route("/users", usersRouter)
	.route("/howls", howlsRouter)
	.get("/health", (c) =>
		c.json({ status: "ok", timestamp: new Date().toISOString() }),
	);

showRoutes(app, { verbose: true });

export type AppType = typeof app;

export default { port: 3001, fetch: app.fetch };
