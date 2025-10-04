ALTER TABLE "agent_database_changes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "agent_database_changes" CASCADE;--> statement-breakpoint
ALTER TABLE "howl_likes" ADD COLUMN "session_id" varchar(10);--> statement-breakpoint
ALTER TABLE "howls" ADD COLUMN "session_id" varchar(10);--> statement-breakpoint
ALTER TABLE "howl_likes" ADD CONSTRAINT "howl_likes_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howls" ADD CONSTRAINT "howls_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_howl_likes_session" ON "howl_likes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_howls_session" ON "howls" USING btree ("session_id");