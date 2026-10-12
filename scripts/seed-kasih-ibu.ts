import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { users, institutions, donations } from "../app/database/schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  console.log("Checking and seeding institution Kasih Ibu for selviamrsya@gmail.com...");

  const email = "selviamrsya@gmail.com";
  const passwordText = "KasihIbu1234";
  
  // LANGSUNG MASUKKAN STRING, TANPA { password: ... } DAN TANPA .hash
  const hashedPassword = await hashPassword(passwordText);

  // 1. Remove from users table if exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    console.log(`Found existing user with email ${email}, removing from users table to prevent auth collision...`);
    await db.delete(users).where(eq(users.email, email));
  }

  // 2. Check if already exists in institutions table
  const existingInst = await db.select().from(institutions).where(eq(institutions.email, email)).limit(1);
  let instId: string;

  if (existingInst.length > 0) {
    console.log(`Updating existing institution ${existingInst[0].institutionName} to APPROVED with new password...`);
    instId = existingInst[0].id;
    await db
      .update(institutions)
      .set({
        institutionName: "Yayasan Kasih Ibu",
        password: hashedPassword, // <-- Pakai variabel string biasa
        status: "APPROVED",
        phoneNumber: "081234567890",
        city: "Jakarta Pusat",
        state: "DKI Jakarta",
        address: "Jl. Kasih Ibu No. 12, Gambir, Jakarta Pusat",
        description: "Lembaga sosial dan panti asuhan yang mendistribusikan perlengkapan sekolah, pakaian, dan kebutuhan sehari-hari untuk anak-anak.",
      })
      .where(eq(institutions.id, instId));
  } else {
    console.log(`Inserting new approved institution Yayasan Kasih Ibu...`);
    const [inserted] = await db
      .insert(institutions)
      .values({
        institutionName: "Yayasan Kasih Ibu",
        email,
        password: hashedPassword, // <-- Pakai variabel string biasa
        phoneNumber: "081234567890",
        city: "Jakarta Pusat",
        state: "DKI Jakarta",
        zipCode: "10110",
        address: "Jl. Kasih Ibu No. 12, Gambir, Jakarta Pusat",
        description: "Lembaga sosial dan panti asuhan yang mendistribusikan perlengkapan sekolah, pakaian, dan kebutuhan sehari-hari untuk anak-anak.",
        status: "APPROVED",
        latitude: -6.1754,
        longitude: 106.8272,
      })
      .returning();
    instId = inserted.id;
  }

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
