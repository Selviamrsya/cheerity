CREATE TYPE "public"."role" AS ENUM('USER', 'INSTITUTION', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"institution_id" uuid NOT NULL,
	"category" varchar(100),
	"description" text,
	"cover" text,
	"target" varchar(50),
	"collected" varchar(50) DEFAULT '0',
	"status" "status" DEFAULT 'PENDING',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "donations_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_name" varchar(255) NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone_number" varchar(20),
	"city" varchar(100),
	"state" varchar(100),
	"zip_code" varchar(20),
	"address" text,
	"verification_evidence" text,
	"has_pickup_service" boolean DEFAULT false,
	"website_or_social" text,
	"description" text,
	"status" "status" DEFAULT 'PENDING',
	"last_activity_date" date DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "institutions_id_unique" UNIQUE("id"),
	CONSTRAINT "institutions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"birthdate" date,
	"phone_number" varchar(20),
	"city" varchar(100),
	"state" varchar(100),
	"zip_code" varchar(20),
	"address" text,
	"role" "role" DEFAULT 'USER',
	"status" "status" DEFAULT 'APPROVED',
	"last_activity_date" date DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;