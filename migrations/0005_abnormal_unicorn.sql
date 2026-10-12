ALTER TABLE "donate_records" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "donate_records" DROP COLUMN "is_anonymous";--> statement-breakpoint
ALTER TABLE "donate_records" DROP COLUMN "approval_date";--> statement-breakpoint
ALTER TABLE "donate_records" DROP COLUMN "delivery_date";--> statement-breakpoint
ALTER TABLE "donate_records" DROP COLUMN "arrived_date";--> statement-breakpoint
ALTER TABLE "donate_records" DROP COLUMN "completed_date";