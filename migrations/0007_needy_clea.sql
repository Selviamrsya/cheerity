ALTER TABLE "institutions" DROP CONSTRAINT "institutions_email_unique";--> statement-breakpoint
ALTER TABLE "institutions" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "institutions" DROP COLUMN "password";