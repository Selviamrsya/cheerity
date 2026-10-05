import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function checkSchema() {
  console.log("Checking database schema...");

  try {
    // Check users table columns
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    console.log("Users table columns:");
    console.table(usersColumns);

    // Check if BetterAuth tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log("All tables in database:");
    console.table(tables);

    // Check sessions table columns
    const sessionsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position;
    `;
    console.log("Sessions table columns:");
    console.table(sessionsColumns);

    // Check account table columns
    const accountColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'account'
      ORDER BY ordinal_position;
    `;
    console.log("Account table columns:");
    console.table(accountColumns);

    // Check verification table columns
    const verificationColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'verification'
      ORDER BY ordinal_position;
    `;
    console.log("Verification table columns:");
    console.table(verificationColumns);

  } catch (error) {
    console.error("Schema check error:", error);
    process.exit(1);
  }
}

checkSchema();