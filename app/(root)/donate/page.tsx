import React from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { donatur } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getDonationsWithDistance } from "@/lib/actions/donation";
import FindDonationClient from "@/components/FindDonationClient";
import { headers } from "next/headers";

const DonatePage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  let userLat: number | null = null;
  let userLng: number | null = null;

  if (session?.user?.id && (session.user.role === "USER" || session.user.role === "ADMIN")) {
    const [userData] = await db
      .select({ latitude: donatur.latitude, longitude: donatur.longitude })
      .from(donatur)
      .where(eq(donatur.userId, session.user.id))
      .limit(1);
    userLat = userData?.latitude ?? null;
    userLng = userData?.longitude ?? null;
  }

  const donations = await getDonationsWithDistance({ userLat, userLng, limit: 50 });

  return (
    <div className="mx-auto w-full px-4 pb-10 pt-8 sm:px-8 md:px-32 md:pb-12 md:pt-12">
      <FindDonationClient
        initialDonations={donations as Parameters<typeof FindDonationClient>[0]["initialDonations"]}
        userLat={userLat}
        userLng={userLng}
        userId={session?.user?.id ?? null}
      />
    </div>
  );
};

export default DonatePage;
