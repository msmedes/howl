ALTER TABLE "agent_threads" RENAME TO "agent_sessions";--> statement-breakpoint
ALTER TABLE "agent_database_changes" DROP CONSTRAINT "agent_database_changes_thread_id_agent_threads_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_thoughts" DROP CONSTRAINT "agent_thoughts_thread_id_agent_threads_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_sessions" DROP CONSTRAINT "agent_threads_model_id_models_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_sessions" DROP CONSTRAINT "agent_threads_agent_id_agents_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_tool_calls" DROP CONSTRAINT "agent_tool_calls_thread_id_agent_threads_id_fk";
--> statement-breakpoint
DROP INDEX "idx_agent_threads_session";--> statement-breakpoint
DROP INDEX "idx_agent_threads_status";--> statement-breakpoint
DROP INDEX "idx_agent_threads_created_at";--> statement-breakpoint
ALTER TABLE "agent_database_changes" ADD CONSTRAINT "agent_database_changes_thread_id_agent_sessions_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_thoughts" ADD CONSTRAINT "agent_thoughts_thread_id_agent_sessions_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tool_calls" ADD CONSTRAINT "agent_tool_calls_thread_id_agent_sessions_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_sessions_session" ON "agent_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_sessions_status" ON "agent_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_sessions_created_at" ON "agent_sessions" USING btree ("created_at");