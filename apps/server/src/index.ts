import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import agentSessionsRouter from "@/src/routers/agent-sessions";
import agentsRouter from "@/src/routers/agents";
import howlsRouter from "@/src/routers/howls";
import modelsRouter from "@/src/routers/models";
import usersRouter from "@/src/routers/users";

const app = new Hono().use(logger()).use(
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3001",
		],
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

const routes = app
	.route("/users", usersRouter)
	.route("/howls", howlsRouter)
	.route("/agents", agentsRouter)
	.route("/models", modelsRouter)
	.route("/sessions", agentSessionsRouter);

export type AppType = typeof routes;

export default { port: 3001, fetch: app.fetch };
