ALTER TABLE "agent_thoughts" RENAME COLUMN "thread_id" TO "session_id";--> statement-breakpoint
ALTER TABLE "agent_tool_calls" RENAME COLUMN "thread_id" TO "session_id";--> statement-breakpoint
ALTER TABLE "agent_thoughts" DROP CONSTRAINT "agent_thoughts_thread_id_agent_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_tool_calls" DROP CONSTRAINT "agent_tool_calls_thread_id_agent_sessions_id_fk";
--> statement-breakpoint
DROP INDEX "idx_agent_sessions_session";--> statement-breakpoint
DROP INDEX "idx_agent_sessions_status";--> statement-breakpoint
DROP INDEX "idx_agent_thoughts_thread";--> statement-breakpoint
DROP INDEX "idx_agent_thoughts_type";--> statement-breakpoint
DROP INDEX "idx_agent_tool_calls_thread";--> statement-breakpoint
DROP INDEX "idx_agent_thoughts_step";--> statement-breakpoint
DROP INDEX "idx_agent_tool_calls_step";--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD COLUMN "raw_session_json" jsonb;--> statement-breakpoint
ALTER TABLE "agent_thoughts" ADD CONSTRAINT "agent_thoughts_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tool_calls" ADD CONSTRAINT "agent_tool_calls_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_thoughts_session" ON "agent_thoughts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_tool_calls_session" ON "agent_tool_calls" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_thoughts_step" ON "agent_thoughts" USING btree ("session_id","step_number");--> statement-breakpoint
CREATE INDEX "idx_agent_tool_calls_step" ON "agent_tool_calls" USING btree ("session_id","step_number");--> statement-breakpoint
ALTER TABLE "agent_sessions" DROP COLUMN "session_id";--> statement-breakpoint
ALTER TABLE "agent_sessions" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "agent_thoughts" DROP COLUMN "thought_type";