CREATE TABLE "agents" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(10)
);
--> statement-breakpoint
ALTER TABLE "agent_threads" RENAME COLUMN "agent_id" TO "agent_friendly_id";--> statement-breakpoint
ALTER TABLE "howls" RENAME COLUMN "agent_id" TO "agent_friendly_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "agent_id" TO "agent_friendly_id";--> statement-breakpoint
ALTER TABLE "howls" DROP CONSTRAINT "howls_agentId_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_agentId_unique";--> statement-breakpoint
ALTER TABLE "agent_threads" DROP CONSTRAINT "agent_threads_agent_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_agent_threads_agent";--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agents_created_at" ON "agents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agents_updated_at" ON "agents" USING btree ("updated_at");--> statement-breakpoint
ALTER TABLE "agent_threads" ADD CONSTRAINT "agent_threads_agent_friendly_id_users_id_fk" FOREIGN KEY ("agent_friendly_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_threads_agent" ON "agent_threads" USING btree ("agent_friendly_id");--> statement-breakpoint
ALTER TABLE "howls" ADD CONSTRAINT "howls_agentFriendlyId_unique" UNIQUE("agent_friendly_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_agentFriendlyId_unique" UNIQUE("agent_friendly_id");