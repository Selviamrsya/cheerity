import { config } from "dotenv";
config({ path: ".env.local" });

// Set DATABASE_URL in process.env
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

import { db } from "./app/database/drizzle";
import { users } from "./app/database/schema";
import { eq } from "drizzle-orm";
import { geocodeAddress } from "./lib/geocoding";

async function checkAndFixUserCoords() {
  // Get all users without coordinates
  const usersWithoutCoords = await db
    .select()
    .from(users)
    .where(eq(users.role, "USER"));

  console.log(`Found ${usersWithoutCoords.length} users`);

  for (const user of usersWithoutCoords) {
    console.log(`\nUser: ${user.email}`);
    console.log(`  City: ${user.city}, State: ${user.state}`);
    console.log(`  Current coords: lat=${user.latitude}, lng=${user.longitude}`);

    if (!user.latitude || !user.longitude) {
      if (user.city && user.state) {
        console.log(`  Attempting to geocode...`);
        const coords = await geocodeAddress(user.address || "", user.city, user.state);
        if (coords) {
          console.log(`  Geocoding successful: ${coords.lat}, ${coords.lng}`);
          await db
            .update(users)
            .set({ latitude: coords.lat, longitude: coords.lng })
            .where(eq(users.id, user.id));
          console.log(`  Updated database`);
        } else {
          console.log(`  Geocoding failed`);
        }
      } else {
        console.log(`  Skipping: missing city or state`);
      }
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

checkAndFixUserCoords().catch(console.error);
