ALTER TABLE "agent_sessions" ADD COLUMN "input_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD COLUMN "output_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD COLUMN "total_tokens" integer DEFAULT 0 NOT NULL;