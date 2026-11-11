import { db } from "@/app/database/drizzle";
import { users, institutions } from "@/app/database/schema";
import { eq, ilike } from "drizzle-orm";

async function checkKasihIbuStatus() {
  console.log("\n=== Checking Kasih Ibu Institution Status ===\n");

  // Search for kasih ibu institution
  const institutionResults = await db
    .select()
    .from(institutions)
    .where(ilike(institutions.institutionName, "%kasih%ibu%"))
    .limit(5);

  console.log(`Found ${institutionResults.length} institution(s) matching "kasih ibu":\n`);

  for (const inst of institutionResults) {
    // Check corresponding user record (shares the same UUID)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, inst.id))
      .limit(1);

    console.log(`--- Institution: ${inst.institutionName} ---`);
    console.log(`ID: ${inst.id}`);
    console.log(`Email: ${user?.email ?? "(no user record)"}`);
    console.log(`Status: ${inst.status}`);
    console.log(`Created: ${inst.createdAt}`);

    if (user) {
      console.log(`\nCorresponding User:`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);

      if (user.status !== inst.status) {
        console.log(`\n⚠️ STATUS MISMATCH DETECTED!`);
        console.log(`Institutions table: ${inst.status}`);
        console.log(`Users table: ${user.status}`);
      } else {
        console.log(`\n✓ Statuses match`);
      }
    } else {
      console.log(`\n⚠️ No user record found with ID ${inst.id}`);
    }

    console.log("\n---\n");
  }

  if (institutionResults.length === 0) {
    console.log("No institutions found matching 'kasih ibu'");
  }
}

checkKasihIbuStatus();
