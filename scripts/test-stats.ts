import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { count, sql } from "drizzle-orm";
import { users, institutions, donations, donateRecords } from "../app/database/schema";

config({ path: ".env.local" });

const client = neon(process.env.DATABASE_URL!);
const db = drizzle({ client });

async function testStats() {
  try {
    const [totalUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.role}::text = 'USER'`);

    const [totalInstitutions] = await db
      .select({ count: count() })
      .from(institutions)
      .where(sql`${institutions.status}::text = 'APPROVED'`);

    const [pendingInstitutions] = await db
      .select({ count: count() })
      .from(institutions)
      .where(sql`${institutions.status}::text = 'PENDING'`);

    const [totalDonations] = await db.select({ count: count() }).from(donations);
    const [totalRequests] = await db.select({ count: count() }).from(donateRecords);

    console.log("Stats successfully fetched:", {
      totalUsers: totalUsers?.count,
      totalInstitutions: totalInstitutions?.count,
      pendingInstitutions: pendingInstitutions?.count,
      totalDonations: totalDonations?.count,
      totalRequests: totalRequests?.count,
    });
  } catch (err) {
    console.error("Test stats failed:", err);
  }
}

testStats();
