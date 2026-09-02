import React from "react";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getDonationsWithDistance } from "@/lib/actions/donation";
import FindDonationClient from "@/components/FindDonationClient";

const DonatePage = async () => {
  const session = await auth();

  let userLat: number | null = null;
  let userLng: number | null = null;

  if (session?.user?.id && session.user.role === "USER") {
    const [userData] = await db
      .select({ latitude: users.latitude, longitude: users.longitude })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    userLat = userData?.latitude ?? null;
    userLng = userData?.longitude ?? null;
  }

  const donations = await getDonationsWithDistance({ userLat, userLng, limit: 50 });

  return (
    <FindDonationClient
      initialDonations={donations as Parameters<typeof FindDonationClient>[0]["initialDonations"]}
      userLat={userLat}
      userLng={userLng}
    />
  );
};

export default DonatePage;
