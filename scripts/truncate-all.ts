import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  donateRecords,
  donations,
  notifications,
  sessions,
  account,
  verification,
  institutions,
  users,
} from "../app/database/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function truncateAll() {
  console.log("🗑️  Truncating all dummy data...");

  // Delete in FK-safe order (children first)
  await db.delete(donateRecords);
  console.log("  ✓ donate_records cleared");

  await db.delete(notifications);
  console.log("  ✓ notifications cleared");

  await db.delete(donations);
  console.log("  ✓ donations cleared");

  await db.delete(sessions);
  console.log("  ✓ sessions cleared");

  await db.delete(account);
  console.log("  ✓ account cleared");

  await db.delete(verification);
  console.log("  ✓ verification cleared");

  await db.delete(institutions);
  console.log("  ✓ institutions cleared");

  await db.delete(users);
  console.log("  ✓ users cleared");

  console.log("\n✅ All tables cleared. Ready for migration.");
  process.exit(0);
}

truncateAll().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
