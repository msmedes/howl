CREATE TABLE "agent_session_token_counts" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"session_id" varchar(10),
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"step_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_session_token_counts" ADD CONSTRAINT "agent_session_token_counts_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_session_token_counts_session_id" ON "agent_session_token_counts" USING btree ("session_id");--> statement-breakpoint
ALTER TABLE "agent_sessions" DROP COLUMN "total_tokens";