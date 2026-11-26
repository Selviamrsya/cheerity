-- Legacy safety: 'REJECTED' institution/user rows are demoted to 'PENDING'
-- (rejected institutions are hard-deleted by the app, so this should be a no-op)
UPDATE "institutions" SET "status" = 'PENDING' WHERE "status" = 'REJECTED';--> statement-breakpoint
UPDATE "users" SET "status" = 'PENDING' WHERE "status" = 'REJECTED';--> statement-breakpoint
ALTER TABLE "institutions" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "institutions" ALTER COLUMN "status" SET DEFAULT 'PENDING'::text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'APPROVED'::text;--> statement-breakpoint
DROP TYPE "public"."status";--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('PENDING', 'APPROVED');--> statement-breakpoint
ALTER TABLE "institutions" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."status";--> statement-breakpoint
ALTER TABLE "institutions" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'APPROVED'::"public"."status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";