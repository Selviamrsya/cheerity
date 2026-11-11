import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "better-auth/crypto";
import { eq, inArray } from "drizzle-orm";
import { users, institutions, donations, donateRecords, account, sessions } from "../app/database/schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  console.log("Checking and seeding institution Kasih Ibu for selviamrsya@gmail.com...");

  const email = "selviamrsya@gmail.com";
  const passwordText = "KasihIbu1234";

  // LANGSUNG MASUKKAN STRING, TANPA { password: ... } DAN TANPA .hash
  const hashedPassword = await hashPassword(passwordText);

  // 1. Remove from users table if exists (cascades to institutions, but
  // donations must be removed first because they have no cascade)
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    console.log(`Found existing user with email ${email}, removing to prevent auth collision...`);
    const oldDonations = await db
      .select({ id: donations.id })
      .from(donations)
      .where(eq(donations.institutionId, existingUser[0].id));
    const oldDonationIds = oldDonations.map((d) => d.id);
    if (oldDonationIds.length > 0) {
      await db.delete(donateRecords).where(inArray(donateRecords.donationId, oldDonationIds));
      await db.delete(donations).where(inArray(donations.id, oldDonationIds));
    }
    await db.delete(donateRecords).where(eq(donateRecords.userId, existingUser[0].id));
    await db.delete(sessions).where(eq(sessions.userId, existingUser[0].id));
    await db.delete(account).where(eq(account.userId, existingUser[0].id));
    await db.delete(users).where(eq(users.email, email));
  }

  // 2. Insert users + account + institutions rows (shared UUID)
  const instId = crypto.randomUUID();
  console.log("Inserting approved institution Yayasan Kasih Ibu...");

  await db.insert(users).values({
    id: instId,
    email,
    password: hashedPassword,
    name: "Yayasan Kasih Ibu",
    fullName: "Yayasan Kasih Ibu",
    role: "INSTITUTION",
    status: "APPROVED",
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    userId: instId,
    accountId: instId,
    providerId: "credential",
    password: hashedPassword,
  });

  await db.insert(institutions).values({
    id: instId,
    userId: instId,
    institutionName: "Yayasan Kasih Ibu",
    phoneNumber: "081234567890",
    city: "Jakarta Pusat",
    state: "DKI Jakarta",
    zipCode: "10110",
    address: "Jl. Kasih Ibu No. 12, Gambir, Jakarta Pusat",
    description: "Lembaga sosial dan panti asuhan yang mendistribusikan perlengkapan sekolah, pakaian, dan kebutuhan sehari-hari untuk anak-anak.",
    status: "APPROVED",
    latitude: -6.1754,
    longitude: 106.8272,
  });

  // 3. Make sure there are some donations associated with this institution so the dashboard has sample data
  const existingDonations = await db.select().from(donations).where(eq(donations.institutionId, instId)).limit(1);
  if (existingDonations.length === 0) {
    console.log("Seeding sample donation campaign for Yayasan Kasih Ibu...");
    await db.insert(donations).values({
      title: "Donasi Seragam & Perlengkapan Sekolah Anak Panti",
      category: "school_supplies",
      target: 200,
      collected: 45,
      description: "Membantu adik-adik panti asuhan mendapatkan seragam dan alat tulis yang layak untuk tahun ajaran baru.",
      cover: "/assets/donation-school.png",
      institutionId: instId,
      deliveryMethods: ["self_delivery", "pickup_by_institution"],
      hasPickupService: true,
      pickupMaxDistanceKm: 15,
      status: "ACTIVE",
    });
  }

  console.log("✅ Successfully seeded institution Yayasan Kasih Ibu!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${passwordText}`);
  console.log(`Status: APPROVED`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding institution:", err);
  process.exit(1);
});
