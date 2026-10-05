import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function fixColumns() {
  console.log("Adding missing columns to account table...\n");

  await sql`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp`;
  console.log("  ✅ access_token_expires_at");

  await sql`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp`;
  console.log("  ✅ refresh_token_expires_at");

  await sql`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text`;
  console.log("  ✅ scope");

  await sql`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`;
  console.log("  ✅ created_at");

  await sql`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`;
  console.log("  ✅ updated_at");

  await sql`ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`;
  console.log("  ✅ verification.updated_at");

  console.log("\n✅ All columns fixed!");
}

fixColumns()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
