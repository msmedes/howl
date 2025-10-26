ALTER TABLE "agent_session_token_counts" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD COLUMN "cumulative_input_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD COLUMN "cumulative_output_tokens" integer DEFAULT 0 NOT NULL;