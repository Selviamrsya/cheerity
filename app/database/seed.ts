import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { CATEGORY_IMAGES } from "../../constants";
import { users, institutions, donations, account } from "./schema";
import { hashPassword } from "better-auth/crypto";
//ini masih pake on wait do nothing, jadi jangan lupa kalo mau update data ini diurus
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

const dummyInstitutionsData = [
  {
    "institutionName": "Panti Asuhan Al-Barkah",
    "email": "albarkah@example.com",
    "password": "albarkah123",
    "phoneNumber": "081234567890",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17141",
    "address": "Jl. Pekayon Raya No. 15",
    "description": "Lembaga sosial yang menaungi anak-anak yatim piatu dan dhuafa.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Donasi Pakaian Layak Pakai",
        "category": "shirt",
        "description": "Dibutuhkan baju anak-anak usia 7-12 tahun.",
        "target": 50,
        "deliveryMethods": ["third_party_courier", "pickup_by_institution"],
        "hasPickupService": true,
        "pickupMaxDistanceKm": 2
      }
    ]
  },
  {
    "institutionName": "Yayasan Kasih Anak Yatim",
    "email": "kasihanakyatim@example.com",
    "password": "kasihanakyatim123",
    "phoneNumber": "081298765432",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17147",
    "address": "Grand Galaxy City Blok RGA",
    "description": "Yayasan penyalur bantuan pendidikan dan kebutuhan pokok anak yatim.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Buku Tulis dan Alat Tulis",
        "category": "school_supplies",
        "description": "Membantu anak-anak asuh untuk persiapan semester baru.",
        "target": 100,
        "deliveryMethods": ["self_delivery"],
        "hasPickupService": false,
        "pickupMaxDistanceKm": 0
      }
    ]
  },
  {
    "institutionName": "Panti Asuhan Nurul Iman",
    "email": "nuruliman@example.com",
    "password": "nuruliman123",
    "phoneNumber": "081311223344",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17121",
    "address": "Jl. Ir. H. Juanda No. 88",
    "description": "Panti asuhan yang fokus pada pemberdayaan anak dhuafa.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Baju bekas anak remaja umur 14-16",
        "category": "shirt",
        "description": "Dibutuhkan stok baju bekas umur 14-16 yang bisa digunakan perempuan maupun laki-laki.",
        "target": 30,
        "deliveryMethods": ["self_delivery", "third_party_courier"],
        "hasPickupService": false,
        "pickupMaxDistanceKm": 0
      }
    ]
  },
  {
    "institutionName": "Rumah Singgah Berkah Ilahi",
    "email": "berkahilahi@example.com",
    "password": "berkahilahi123",
    "phoneNumber": "081455667788",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17111",
    "address": "Jl. Cut Meutia No. 12",
    "description": "Rumah singgah untuk anak jalanan dan fakir miskin.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Sepatu Sekolah Layak Pakai",
        "category": "school_supplies",
        "description": "Dibutuhkan sepatu hitam ukuran 35-40.",
        "target": 25,
        "deliveryMethods": ["self_delivery", "third_party_courier"],
        "hasPickupService": false,
        "pickupMaxDistanceKm": 0
      }
    ]
  },
  {
    "institutionName": "Yayasan Panti Asuhan Darul Falah",
    "email": "darulfalah@example.com",
    "password": "darulfalah123",
    "phoneNumber": "081599887766",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17132",
    "address": "Jl. KH. Noer Ali No. 45",
    "description": "Lembaga sosial pendidikan agama dan sosial kemasyarakatan.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Al-Qur'an dan Buku Iqra",
        "category": "school_supplies",
        "description": "Dibutuhkan Al-Qur'an baru atau layak baca untuk TPA.",
        "target": 40,
        "deliveryMethods": ["self_delivery", "pickup_by_institution"],
        "hasPickupService": true,
        "pickupMaxDistanceKm": 6
      }
    ]
  },
  {
    "institutionName": "Panti Asuhan Al-Hidayah",
    "email": "alhidayah@example.com",
    "password": "alhidayah123",
    "phoneNumber": "081677889900",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17151",
    "address": "Jl. Kemang Pratama Raya",
    "description": "Menampung dan membimbing anak yatim piatu berprestasi.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Perlengkapan Mandi & Cuci",
        "category": "home_supplies",
        "description": "Sabun, sampo, dan pasta gigi untuk kebutuhan santri.",
        "target": 60,
        "deliveryMethods": ["self_delivery", "third_party_courier"],
        "hasPickupService": false,
        "pickupMaxDistanceKm": 0
      }
    ]
  },
  {
    "institutionName": "Yayasan Bina Mandiri Sejahtera",
    "email": "binamandiri@example.com",
    "password": "binamandiri123",
    "phoneNumber": "081722334455",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17144",
    "address": "Jl. Jatiasih Raya No. 7",
    "description": "Fokus pada kesejahteraan anak-anak kurang mampu di perkotaan.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Tas Sekolah Bekas Layak Pakai",
        "category": "school_supplies",
        "description": "Tas punggung untuk anak SMP/SMA.",
        "target": 35,
        "deliveryMethods": ["self_delivery", "pickup_by_institution"],
        "hasPickupService": true,
        "pickupMaxDistanceKm": 4
      }
    ]
  },
  {
    "institutionName": "Panti Asuhan Yayasan Aisyiyah",
    "email": "aisyiyah@example.com",
    "password": "password123",
    "phoneNumber": "081833445566",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17135",
    "address": "Jl. Mayor Madring No. 20",
    "description": "Panti asuhan putri yang membina keterampilan hidup mandiri.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Mukena dan Alat Salat",
        "category": "home_supplies",
        "description": "Mukena baru atau bekas layak pakai untuk kegiatan ibadah.",
        "target": 45,
        "deliveryMethods": ["self_delivery", "third_party_courier"],
        "hasPickupService": false,
        "pickupMaxDistanceKm": 0
      }
    ]
  },
  {
    "institutionName": "LKS Wahana Kesejahteraan Sosial",
    "email": "wahanasosial@example.com",
    "password": "wahanasosial123",
    "phoneNumber": "081944556677",
    "city": "Bekasi",
    "state": "Jawa Barat",
    "zipCode": "17125",
    "address": "Jl. Pulo Sirih Barat Raya",
    "description": "Lembaga kesejahteraan sosial penyalur bantuan kemanusiaan.",
    "latitude": -6.200000,
    "longitude": 106.800000,
    "donations": [
      {
        "title": "Selimut dan Tikar",
        "category": "home_supplies",
        "description": "Selimut hangat untuk anak-anak asuh di asrama.",
        "target": 20,
        "deliveryMethods": ["self_delivery", "third_party_courier"],
        "hasPickupService": false,
        "pickupMaxDistanceKm": 0
      }
    ]
  }
];

const seed = async () => {
  console.log("Seeding database...");
  try {
    //Tentukan atau cari user admin berdasarkan email
    const adminEmail = "selviam2017@gmail.com";
    const hashedPasswordAdmin = await hashPassword("Admin1234");

    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    let adminId = existingAdmin?.id;

    if (!adminId) {
      adminId = crypto.randomUUID();
      await db.insert(users).values({
        id: adminId,
        email: adminEmail,
        password: hashedPasswordAdmin,
        name: "Admin Cheerity",
        role: "ADMIN",
        status: "APPROVED",
        fullName: "Admin Cheerity",
      });
      console.log("Admin user inserted:", adminEmail);
    } else {
      adminId = existingAdmin.id;
      console.log("Admin user already exists, using existing ID:", adminId);
    }

    await db
      .insert(account)
      .values({
        id: crypto.randomUUID(),
        userId: adminId,
        accountId: adminId,
        providerId: "credential",
        password: hashedPasswordAdmin,
      })
      .onConflictDoNothing();

    console.log("Admin account credential linked successfully.");

    for (const instData of dummyInstitutionsData) {
      const hashedInstPassword = await hashPassword(instData.password);

      // Cek apakah user institusi sudah ada berdasarkan email
      const [existingInstUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, instData.email))
        .limit(1);

      let instId = existingInstUser?.id;

      if (!instId) {
        instId = crypto.randomUUID();
        // Insert ke tabel users (untuk auth login)
        await db
          .insert(users)
          .values({
            id: instId,
            email: instData.email,
            password: hashedInstPassword,
            name: instData.institutionName,
            fullName: instData.institutionName,
            role: "INSTITUTION",
            status: "APPROVED",
          })
          .onConflictDoNothing();
      }

      // Insert ke tabel account untuk better-auth credentials
      await db
        .insert(account)
        .values({
          id: crypto.randomUUID(),
          userId: instId,
          accountId: instId,
          providerId: "credential",
          password: hashedInstPassword,
        })
        .onConflictDoNothing();

      // Insert ke tabel institutions
      const [insertedInstitution] = await db
        .insert(institutions)
        .values({
          id: instId,
          userId: instId,
          institutionName: instData.institutionName,
          phoneNumber: instData.phoneNumber,
          city: instData.city,
          state: instData.state,
          zipCode: instData.zipCode,
          address: instData.address,
          description: instData.description,
          status: "APPROVED",
          latitude: instData.latitude,
          longitude: instData.longitude,
        })
        .onConflictDoNothing()
        .returning();

      if (!insertedInstitution) {
        console.log(`Institution ${instData.institutionName} already exists, skipping donations.`);
        continue;
      }

      console.log(`Institution inserted: ${instData.institutionName}`);

      // Insert masing-masing donasi untuk institusi tersebut
      for (const donation of instData.donations) {
        await db.insert(donations).values({
          institutionId: instId,
          title: donation.title,
          category: donation.category,
          description: donation.description,
          cover: CATEGORY_IMAGES[donation.category] || "/assets/donation-school.png",
          target: donation.target,
          collected: 0,
          deliveryMethods: donation.deliveryMethods,
          hasPickupService: donation.hasPickupService,
          pickupMaxDistanceKm: donation.hasPickupService ? donation.pickupMaxDistanceKm : null,
          status: "ACTIVE",
        });
      }
    }

    console.log("All dummy institutions and donations inserted successfully.");
    console.log("Seeding complete.");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();