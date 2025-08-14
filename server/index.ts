import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import howlsRouter from "@/routers/howls";
import usersRouter from "@/routers/users";

const app = new Hono();

// Middleware
app.use(logger());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static files from the public directory
app.use('/*', serveStatic({ root: './public' }));

// API routes
app.route("/api/users", usersRouter);
app.route("/api/howls", howlsRouter);

// Health check endpoint
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

export default { port: 3001, fetch: app.fetch };
