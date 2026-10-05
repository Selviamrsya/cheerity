ALTER TABLE "donate_records" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "donate_records" ALTER COLUMN "status" SET DEFAULT 'PENDING'::text;--> statement-breakpoint
DROP TYPE "public"."donation_request_status";--> statement-breakpoint
CREATE TYPE "public"."donation_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'ON_PROGRESS', 'WAITING_FOR_DOCUMENTATION', 'COMPLETED');--> statement-breakpoint
ALTER TABLE "donate_records" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."donation_request_status";--> statement-breakpoint
ALTER TABLE "donate_records" ALTER COLUMN "status" SET DATA TYPE "public"."donation_request_status" USING "status"::"public"."donation_request_status";--> statement-breakpoint
ALTER TABLE "donate_records" ADD COLUMN "documentation_photo" text;--> statement-breakpoint
ALTER TABLE "donate_records" ADD COLUMN "cancel_reason" text;