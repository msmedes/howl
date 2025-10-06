CREATE TABLE "agent_sessions" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"model_id" varchar(10),
	"agent_id" varchar(10),
	"raw_session_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_thoughts" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"session_id" varchar(10) NOT NULL,
	"step_number" integer NOT NULL,
	"content" text NOT NULL,
	"model_id" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_tool_calls" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"session_id" varchar(10) NOT NULL,
	"step_number" integer NOT NULL,
	"tool_name" varchar(100) NOT NULL,
	"arguments" jsonb,
	"model_id" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(10),
	"model_id" varchar(10),
	"prompt" text NOT NULL,
	"last_run_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "howl_ancestors" (
	"ancestor_id" varchar(10),
	"descendant_id" varchar(10),
	"depth" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "howl_ancestors_ancestor_id_descendant_id_pk" PRIMARY KEY("ancestor_id","descendant_id")
);
--> statement-breakpoint
CREATE TABLE "howl_likes" (
	"user_id" varchar(10),
	"howl_id" varchar(10),
	"session_id" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "howl_likes_user_id_howl_id_pk" PRIMARY KEY("user_id","howl_id")
);
--> statement-breakpoint
CREATE TABLE "howls" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"agent_friendly_id" serial NOT NULL,
	"content" varchar(280) NOT NULL,
	"user_id" varchar(10),
	"parent_id" varchar(10),
	"session_id" varchar(10),
	"is_original_post" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "howls_agentFriendlyId_unique" UNIQUE("agent_friendly_id")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" varchar(10),
	"following_id" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"user_id" varchar(10),
	"blocked_user_id" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"agent_friendly_id" serial NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255),
	"bio" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_agentFriendlyId_unique" UNIQUE("agent_friendly_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_thoughts" ADD CONSTRAINT "agent_thoughts_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_thoughts" ADD CONSTRAINT "agent_thoughts_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tool_calls" ADD CONSTRAINT "agent_tool_calls_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tool_calls" ADD CONSTRAINT "agent_tool_calls_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howl_ancestors" ADD CONSTRAINT "howl_ancestors_ancestor_id_howls_id_fk" FOREIGN KEY ("ancestor_id") REFERENCES "public"."howls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howl_ancestors" ADD CONSTRAINT "howl_ancestors_descendant_id_howls_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."howls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howl_likes" ADD CONSTRAINT "howl_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howl_likes" ADD CONSTRAINT "howl_likes_howl_id_howls_id_fk" FOREIGN KEY ("howl_id") REFERENCES "public"."howls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howl_likes" ADD CONSTRAINT "howl_likes_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howls" ADD CONSTRAINT "howls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howls" ADD CONSTRAINT "howls_session_id_agent_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."agent_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_user_id_users_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_sessions_created_at" ON "agent_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agent_thoughts_session" ON "agent_thoughts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_thoughts_step" ON "agent_thoughts" USING btree ("session_id","step_number");--> statement-breakpoint
CREATE INDEX "idx_agent_thoughts_created_at" ON "agent_thoughts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agent_tool_calls_session" ON "agent_tool_calls" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_tool_calls_step" ON "agent_tool_calls" USING btree ("session_id","step_number");--> statement-breakpoint
CREATE INDEX "idx_agent_tool_calls_name" ON "agent_tool_calls" USING btree ("tool_name");--> statement-breakpoint
CREATE INDEX "idx_agent_tool_calls_created_at" ON "agent_tool_calls" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agents_created_at" ON "agents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_agents_updated_at" ON "agents" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_models_name" ON "models" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_ancestors_ancestor_depth" ON "howl_ancestors" USING btree ("ancestor_id","depth");--> statement-breakpoint
CREATE INDEX "idx_ancestors_descendant_depth" ON "howl_ancestors" USING btree ("descendant_id","depth");--> statement-breakpoint
CREATE INDEX "idx_ancestors_depth" ON "howl_ancestors" USING btree ("depth");--> statement-breakpoint
CREATE INDEX "idx_howl_ancestors_created_at" ON "howl_ancestors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_howl_likes_user" ON "howl_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_howl_likes_howl" ON "howl_likes" USING btree ("howl_id");--> statement-breakpoint
CREATE INDEX "idx_howl_likes_session" ON "howl_likes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_howl_likes_created_at" ON "howl_likes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_howls_user_original" ON "howls" USING btree ("user_id","is_original_post");--> statement-breakpoint
CREATE INDEX "idx_howls_parent" ON "howls" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_howls_session" ON "howls" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_howls_user_created" ON "howls" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_howls_created_at" ON "howls" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_follow" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "idx_follows_created_at" ON "follows" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_block" ON "user_blocks" USING btree ("user_id","blocked_user_id");--> statement-breakpoint
CREATE INDEX "idx_user_blocks_user" ON "user_blocks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_blocks_blocked_user" ON "user_blocks" USING btree ("blocked_user_id");--> statement-breakpoint
CREATE INDEX "idx_user_blocks_created_at" ON "user_blocks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");