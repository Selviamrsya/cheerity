import React from "react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getDonationById } from "@/lib/actions/donation";
import DonationDetailClient from "@/components/DonationDetailClient";
import { headers } from "next/headers";

type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  address: string | null;
};

const DonationDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  const donation = await getDonationById(id);

  if (!donation) {
    notFound();
  }

  // 2. Berikan tipe eksplisit pada variabel userProfile
  let userProfile: UserProfile | null = null;

  if (session?.user?.id && (session.user.role === "USER" || session.user.role === "ADMIN")) {
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
        name: u.fullName ?? "", 
        phone: u.phoneNumber,
        city: u.city,
        state: u.state,
        zipCode: u.zipCode,
        address: u.address,
      };
    }
  }

  return (
    <div className="mx-auto w-full max-w-345 px-8 pb-10 md:px-32 md:pb-14">
      <DonationDetailClient
        donation={donation}
        user={userProfile}
      />
    </div>
  );
};

export default DonationDetailPage;