ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");