ALTER TABLE "agents" ADD COLUMN "prompt_length" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "prompt_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_session_token_counts" DROP COLUMN "total_tokens";--> statement-breakpoint
ALTER TABLE "agent_sessions" DROP COLUMN "cumulative_input_tokens";--> statement-breakpoint
ALTER TABLE "agent_sessions" DROP COLUMN "cumulative_output_tokens";