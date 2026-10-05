import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import dummyDonations from "../../constants/dummyDonations.json";
import { CATEGORY_IMAGES } from "../../constants";
import { users, institutions, donations, account } from "./schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

import { auth } from "../../lib/auth";

import { hashPassword } from "better-auth/crypto";

const seed = async () => {
  console.log("Seeding database...");

  try {
    // Insert admin user
    const hashedAdmin = await hashPassword("Admin1234");
    
    await db
      .insert(users)
      .values({
        email: "selviam2017@gmail.com",
        password: hashedAdmin,
        name: "Admin Cheerity",
        role: "ADMIN",
        status: "APPROVED",
        fullName: "Admin Cheerity"
      })
      .onConflictDoNothing();

    console.log("Admin user inserted: selviam2017@gmail.com / Admin1234");

    // Insert a dummy institution for seeding donations
    const hashedInst = await hashPassword("Institusi1234");
    
    // Insert into users for better-auth login
    const [existingInstUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "kasihibu@example.com"))
      .limit(1);

    let instId = existingInstUser?.id;

    if (!instId) {
      instId = crypto.randomUUID();
      await db
        .insert(users)
        .values({
          id: instId,
          email: "kasihibu@example.com",
          password: hashedInst,
          name: "Lembaga Kasih Ibu",
          fullName: "Lembaga Kasih Ibu",
          phoneNumber: "081234567890",
          city: "Jakarta",
          state: "DKI Jakarta",
          zipCode: "10110",
          address: "Jl. Kasih No. 1, Jakarta Pusat",
          role: "INSTITUTION",
          status: "APPROVED",
        })
        .onConflictDoNothing();
    }

    await db
      .insert(account)
      .values({
        id: crypto.randomUUID(),
        userId: instId,
        accountId: instId,
        providerId: "credential",
        password: hashedInst,
      })
      .onConflictDoNothing();

    const [dummyInstitution] = await db
      .insert(institutions)
      .values({
        id: instId,
        institutionName: "Lembaga Kasih Ibu",
        email: "kasihibu@example.com",
        password: hashedInst,
        phoneNumber: "081234567890",
        city: "Jakarta",
        state: "DKI Jakarta",
        zipCode: "10110",
        address: "Jl. Kasih No. 1, Jakarta Pusat",
        description: "Lembaga sosial yang berfokus pada kesejahteraan anak dan keluarga kurang mampu.",
        status: "APPROVED",
        latitude: -6.2,
        longitude: 106.816666,
      })
      .onConflictDoNothing()
      .returning();

    if (!dummyInstitution) {
      console.log("Institution already exists, skipping donation seed.");
      return;
    }

    console.log("Dummy institution inserted.");

    // Insert dummy donations with cover photos from assets folder
    for (const donation of dummyDonations) {
      await db.insert(donations).values({
        institutionId: dummyInstitution.id,
        title: donation.title,
        category: donation.category,
        description: donation.description,
        cover: CATEGORY_IMAGES[donation.category] || "/assets/donation-school.png",
        target: donation.target,
        collected: 0,
        deliveryMethods: donation.deliveryMethods,
        hasPickupService: donation.hasPickupService,
        pickupMaxDistanceKm: donation.pickupMaxDistanceKm ?? null,
        status: "ACTIVE",
      });
    }

    console.log("Dummy donations inserted.");
    console.log("Seeding complete.");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();