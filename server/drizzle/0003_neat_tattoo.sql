CREATE TABLE "howl_threads" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"userId" varchar(21),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "howls" ADD COLUMN "threadId" varchar(21);--> statement-breakpoint
ALTER TABLE "howl_threads" ADD CONSTRAINT "howl_threads_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "howls" ADD CONSTRAINT "howls_threadId_howl_threads_id_fk" FOREIGN KEY ("threadId") REFERENCES "public"."howl_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_follow" ON "follows" USING btree ("followerId","followingId");