import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function cleanBetterAuthTables() {
  console.log("Cleaning duplicate columns from BetterAuth tables...");

  try {
    // Drop and recreate account table with ONLY the required columns
    await sql`DROP TABLE IF EXISTS account CASCADE;`;
    console.log("Dropped account table");

    await sql`
      CREATE TABLE "account" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "expires_at" timestamp,
        "password" text
      );
    `;
    console.log("Created account table with correct schema");

    // Drop and recreate verification table with ONLY the required columns
    await sql`DROP TABLE IF EXISTS verification CASCADE;`;
    console.log("Dropped verification table");

    await sql`
      CREATE TABLE "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp with time zone DEFAULT now()
      );
    `;
    console.log("Created verification table with correct schema");

    console.log("BetterAuth tables cleaned successfully!");
  } catch (error) {
    console.error("Error cleaning BetterAuth tables:", error);
    process.exit(1);
  }
}

cleanBetterAuthTables();