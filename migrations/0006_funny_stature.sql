CREATE TABLE "donatur" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"birthdate" date,
	"phone_number" varchar(20),
	"city" varchar(100),
	"state" varchar(100),
	"zip_code" varchar(20),
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "donatur_id_unique" UNIQUE("id"),
	CONSTRAINT "donatur_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "donatur" ADD CONSTRAINT "donatur_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "birthdate";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "zip_code";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "longitude";--> statement-breakpoint
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_user_id_unique" UNIQUE("user_id");