import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, count } from "drizzle-orm";
import { users } from "../app/database/schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function check() {
  try {
    console.log("Checking columns of users table...");
    const rawCols = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `;
    console.log("Users columns:", rawCols);

    console.log("Testing users query...");
    const res = await db.select({ count: count() }).from(users).where(eq(users.role, "USER"));
    console.log("Query success:", res);
  } catch (err) {
    console.error("Query failed with error:", err);
  }
}

check();
