import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function removeDuplicateColumns() {
  console.log("Removing duplicate columns from BetterAuth tables...");

  try {
    // Remove duplicate columns from account table
    const duplicateAccountColumns = [
      'id', 'accountId', 'userId', 'providerId', 'accessToken', 'refreshToken', 'idToken',
      'accessTokenExpiresAt', 'refreshTokenExpiresAt', 'scope', 'password', 'createdAt', 'updatedAt'
    ];

    for (const column of duplicateAccountColumns) {
      try {
        await sql`ALTER TABLE "account" DROP COLUMN IF EXISTS "${column}";`;
        console.log(`Dropped column ${column} from account table`);
      } catch (error) {
        console.log(`Column ${column} does not exist or cannot be dropped: ${error}`);
      }
    }

    // Remove duplicate columns from verification table
    const duplicateVerificationColumns = [
      'id', 'identifier', 'value', 'expiresAt', 'createdAt', 'updatedAt'
    ];

    for (const column of duplicateVerificationColumns) {
      try {
        await sql`ALTER TABLE "verification" DROP COLUMN IF EXISTS "${column}";`;
        console.log(`Dropped column ${column} from verification table`);
      } catch (error) {
        console.log(`Column ${column} does not exist or cannot be dropped: ${error}`);
      }
    }

    console.log("Removed duplicate columns successfully!");
  } catch (error) {
    console.error("Error removing duplicate columns:", error);
    process.exit(1);
  }
}

removeDuplicateColumns();