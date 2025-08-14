import { Hono } from "hono";
import { logger } from "hono/logger";
import howlsRouter from "@/routers/howls";
import usersRouter from "@/routers/users";

const app = new Hono();
app.use(logger())

app.route("/users", usersRouter);
app.route("/howls", howlsRouter);



export default { port: 3001, fetch: app.fetch };
