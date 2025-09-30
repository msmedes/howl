CREATE TABLE "models" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_threads" DROP CONSTRAINT "agent_threads_agent_friendly_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_agent_threads_agent";--> statement-breakpoint
ALTER TABLE "agent_database_changes" ADD COLUMN "model_id" varchar(10);--> statement-breakpoint
ALTER TABLE "agent_thoughts" ADD COLUMN "model_id" varchar(10);--> statement-breakpoint
ALTER TABLE "agent_threads" ADD COLUMN "model_id" varchar(10);--> statement-breakpoint
ALTER TABLE "agent_tool_calls" ADD COLUMN "model_id" varchar(10);--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "agent_friendly_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "prompt" text NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "last_run_at" timestamp;--> statement-breakpoint
ALTER TABLE "agent_database_changes" ADD CONSTRAINT "agent_database_changes_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_thoughts" ADD CONSTRAINT "agent_thoughts_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_threads" ADD CONSTRAINT "agent_threads_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tool_calls" ADD CONSTRAINT "agent_tool_calls_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_threads" DROP COLUMN "agent_friendly_id";--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_agentFriendlyId_unique" UNIQUE("agent_friendly_id");