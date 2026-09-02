import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import dummyDonations from "../../constants/dummyDonations.json";
import { users, institutions, donations } from "./schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

const seed = async () => {
  console.log("Seeding database...");

  try {
    // Insert admin user
    // Admin credentials: selviam2017@gmail.com / Admin1234
    const hashedAdminPassword = await hash("Admin1234", 10);
    await db
      .insert(users)
      .values({
        fullName: "Admin Cheerity",
        email: "selviam2017@gmail.com",
        password: hashedAdminPassword,
        role: "ADMIN",
        status: "APPROVED",
      })
      .onConflictDoNothing();

    console.log("Admin user inserted: selviam2017@gmail.com / Admin1234");

    // Insert a dummy institution for seeding donations
    const hashedInstPassword = await hash("Institusi1234", 10);
    const [dummyInstitution] = await db
      .insert(institutions)
      .values({
        institutionName: "Lembaga Kasih Ibu",
        email: "kasihibu@example.com",
        password: hashedInstPassword,
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

    // Insert dummy donations (cover photo left empty for now)
    for (const donation of dummyDonations) {
      await db.insert(donations).values({
        institutionId: dummyInstitution.id,
        title: donation.title,
        category: donation.category,
        description: donation.description,
        cover: null,
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