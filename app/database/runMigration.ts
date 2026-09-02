import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  console.log("Resetting database schema on Neon...");

  try {
    // Drop existing tables and types for clean setup
    await sql`DROP TABLE IF EXISTS donate_records CASCADE;`;
    await sql`DROP TABLE IF EXISTS donations CASCADE;`;
    await sql`DROP TABLE IF EXISTS institutions CASCADE;`;
    await sql`DROP TABLE IF EXISTS notifications CASCADE;`;
    await sql`DROP TABLE IF EXISTS users CASCADE;`;

    await sql`DROP TYPE IF EXISTS donation_campaign_status CASCADE;`;
    await sql`DROP TYPE IF EXISTS donation_request_status CASCADE;`;
    await sql`DROP TYPE IF EXISTS role CASCADE;`;
    await sql`DROP TYPE IF EXISTS status CASCADE;`;

    console.log("Old tables dropped successfully.");

    // Create enums
    await sql`CREATE TYPE "public"."donation_campaign_status" AS ENUM('ACTIVE', 'COMPLETED');`;
    await sql`CREATE TYPE "public"."donation_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'ON_PROGRESS', 'ARRIVED', 'COMPLETED');`;
    await sql`CREATE TYPE "public"."role" AS ENUM('USER', 'INSTITUTION', 'ADMIN');`;
    await sql`CREATE TYPE "public"."status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');`;

    console.log("Enums created.");

    // Create tables
    await sql`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "full_name" varchar(255) NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "birthdate" date,
        "phone_number" varchar(20),
        "city" varchar(100),
        "state" varchar(100),
        "zip_code" varchar(20),
        "address" text,
        "latitude" double precision,
        "longitude" double precision,
        "role" "role" DEFAULT 'USER',
        "status" "status" DEFAULT 'APPROVED',
        "created_at" timestamp with time zone DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE "institutions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "institution_name" varchar(255) NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "phone_number" varchar(20),
        "city" varchar(100),
        "state" varchar(100),
        "zip_code" varchar(20),
        "address" text,
        "latitude" double precision,
        "longitude" double precision,
        "verification_evidence" text,
        "website_or_social" text,
        "description" text,
        "status" "status" DEFAULT 'PENDING',
        "created_at" timestamp with time zone DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE "donations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "institution_id" uuid NOT NULL REFERENCES "institutions"("id"),
        "title" varchar(255) NOT NULL,
        "category" varchar(100) NOT NULL,
        "description" text,
        "cover" text,
        "target" integer NOT NULL,
        "collected" integer DEFAULT 0 NOT NULL,
        "delivery_methods" text[] NOT NULL,
        "has_pickup_service" boolean DEFAULT false,
        "pickup_max_distance_km" integer,
        "status" "donation_campaign_status" DEFAULT 'ACTIVE',
        "created_at" timestamp with time zone DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE "donate_records" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "donation_id" uuid NOT NULL REFERENCES "donations"("id"),
        "donor_name" varchar(255),
        "is_anonymous" boolean DEFAULT false NOT NULL,
        "phone_number" varchar(20),
        "city" varchar(100),
        "state" varchar(100),
        "zip_code" varchar(20),
        "address" text,
        "quantity" integer NOT NULL,
        "notes" text,
        "donor_photo" text,
        "delivery_method" varchar(50) NOT NULL,
        "estimated_pickup_date" date,
        "estimated_pickup_time" varchar(20),
        "status" "donation_request_status" DEFAULT 'PENDING' NOT NULL,
        "arrival_proof_photo" text,
        "rejection_reason" text,
        "request_date" timestamp with time zone DEFAULT now(),
        "approval_date" timestamp with time zone,
        "delivery_date" timestamp with time zone,
        "arrived_date" timestamp with time zone,
        "completed_date" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "recipient_id" uuid NOT NULL,
        "recipient_type" varchar(20) NOT NULL,
        "title" varchar(255) NOT NULL,
        "message" text NOT NULL,
        "type" varchar(50) NOT NULL,
        "is_read" boolean DEFAULT false NOT NULL,
        "related_id" uuid,
        "created_at" timestamp with time zone DEFAULT now()
      );
    `;

    console.log("New tables created successfully.");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

run();
