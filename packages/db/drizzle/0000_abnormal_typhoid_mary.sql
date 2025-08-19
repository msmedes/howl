CREATE TABLE "follows" (
	"followerId" varchar(21),
	"followingId" varchar(21),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "howl_ancestors" (
	"ancestorId" varchar(21),
	"descendantId" varchar(21),
	"depth" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "howl_ancestors_ancestorId_descendantId_pk" PRIMARY KEY("ancestorId","descendantId")
);
--> statement-breakpoint
CREATE TABLE "howls" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"content" varchar(140) NOT NULL,
	"userId" varchar(21),
	"parentId" varchar(21),
	"isOriginalPost" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"bio" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_users_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_users_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howl_ancestors" ADD CONSTRAINT "howl_ancestors_ancestorId_howls_id_fk" FOREIGN KEY ("ancestorId") REFERENCES "public"."howls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howl_ancestors" ADD CONSTRAINT "howl_ancestors_descendantId_howls_id_fk" FOREIGN KEY ("descendantId") REFERENCES "public"."howls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howls" ADD CONSTRAINT "howls_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howls" ADD CONSTRAINT "howls_parentId_howls_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."howls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_follow" ON "follows" USING btree ("followerId","followingId");--> statement-breakpoint
CREATE INDEX "idx_ancestors_ancestor_depth" ON "howl_ancestors" USING btree ("ancestorId","depth");--> statement-breakpoint
CREATE INDEX "idx_ancestors_descendant_depth" ON "howl_ancestors" USING btree ("descendantId","depth");--> statement-breakpoint
CREATE INDEX "idx_ancestors_depth" ON "howl_ancestors" USING btree ("depth");--> statement-breakpoint
CREATE INDEX "idx_howls_user_original" ON "howls" USING btree ("userId","isOriginalPost");--> statement-breakpoint
CREATE INDEX "idx_howls_parent" ON "howls" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "idx_howls_user_created" ON "howls" USING btree ("userId","createdAt");