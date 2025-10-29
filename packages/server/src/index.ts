import Anthropic from "@anthropic-ai/sdk";
import { createDatabase, type Database } from "@howl/db";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { streamText } from "hono/streaming";
import agentSessionsRouter from "@/src/routers/agent-sessions";
import agentsRouter from "@/src/routers/agents";
import howlsRouter from "@/src/routers/howls";
import modelsRouter from "@/src/routers/models";
import usersRouter from "@/src/routers/users";

let db: Database;

type Bindings = {
	DATABASE_URL: string;
	ANTHROPIC_API_KEY: string;
};

export type Variables = {
	db: Database;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
	.use(logger())
	.use(
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
	)
	.use(async (c, next) => {
		const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
		db = createDatabase({ databaseUrl: DATABASE_URL });
		c.set("db", db);
		await next();
	});

const routes = app
	.route("/users", usersRouter)
	.route("/howls", howlsRouter)
	.route("/agents", agentsRouter)
	.route("/models", modelsRouter)
	.route("/sessions", agentSessionsRouter)
	.get("/stream", async (c) => {
		const { ANTHROPIC_API_KEY } = env<{ ANTHROPIC_API_KEY: string }>(c);
		const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
		return streamText(c, async (stream) => {
			const streamResponse = client.messages
				.stream({
					model: "claude-3-7-sonnet-latest",
					max_tokens: 1024,
					messages: [
						{
							role: "user",
							content:
								"Hey there, we are testing streaming.  Can you hit me with the first few sentences of the gettysburg address?",
						},
					],
				})
				.on("message", (message) => console.log("controller message", message));
			for await (const event of streamResponse) {
				switch (event.type) {
					case "content_block_delta":
						stream.write(event.delta.text);
						break;
					default:
						console.log("controller event", event);
				}
			}
			await stream.close();
			console.log("Streaming ended");
		});
	});

export type AppType = typeof routes;

export default { port: 3001, fetch: app.fetch };
