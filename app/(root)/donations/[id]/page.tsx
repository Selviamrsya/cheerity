import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getDonationById } from "@/lib/actions/donation";
import DonationDetailClient from "@/components/DonationDetailClient";

const DonationDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth();

  const donation = await getDonationById(id);

  if (!donation) {
    notFound();
  }

  let userProfile = null;

  if (session?.user?.id && session.user.role === "USER") {
    const [u] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        city: users.city,
        state: users.state,
        zipCode: users.zipCode,
        address: users.address,
        latitude: users.latitude,
        longitude: users.longitude,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (u) {
      userProfile = {
        id: u.id,
        name: u.fullName,
        phone: u.phoneNumber ?? "",
        city: u.city ?? "",
        state: u.state ?? "",
        zipCode: u.zipCode ?? "",
        address: u.address ?? "",
      };
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <DonationDetailClient
        donation={donation}
        user={userProfile}
      />
    </div>
  );
};

export default DonationDetailPage;