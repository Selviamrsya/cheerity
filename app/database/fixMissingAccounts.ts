/**
 * Add missing columns to the account table and fix missing account records.
 * Run with: npx tsx app/database/fixMissingAccounts.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function fix() {
  console.log("Step 1: Adding missing columns to account table...\n");

  const alterStatements = [
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now()`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`,
    `ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now()`,
  ];

  for (const stmt of alterStatements) {
    try {
      await sql`${stmt}`;
      console.log(`  ✅ ${stmt.slice(0, 80)}...`);
    } catch (err: any) {
      if (err.code === "42701") {
        // column already exists
        console.log(`  ✓ Already exists, skipping.`);
      } else {
        console.error(`  ❌ Error:`, err.message);
      }
    }
  }

  console.log("\nStep 2: Creating missing account records for existing users...\n");

  // Find users with passwords that don't have an account record
  const usersWithoutAccount = await sql`
    SELECT u.id, u.password 
    FROM users u 
    LEFT JOIN account a ON a.user_id = u.id 
    WHERE u.password IS NOT NULL 
    AND a.id IS NULL
  `;

  console.log(`  Found ${usersWithoutAccount.length} users without account records.`);

  for (const user of usersWithoutAccount) {
    const newId = crypto.randomUUID();
    await sql`
      INSERT INTO account (id, user_id, account_id, provider_id, password)
      VALUES (${newId}, ${user.id}, ${user.id}, 'credential', ${user.password})
    `;
    console.log(`  ✅ Created account for user ${user.id}`);
  }

  console.log("\n✅ All done! Try logging in now.");
}

fix()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
