CREATE TABLE "agent_memories" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"session_id" varchar(10) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN "session_id" varchar(10);--> statement-breakpoint
ALTER TABLE "agent_memories" ADD CONSTRAINT "agent_memories_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_memories_session" ON "agent_memories" USING btree ("session_id");--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;