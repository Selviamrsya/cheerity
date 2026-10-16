import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users, institutions, donatur } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getDonationCampaignById } from "@/lib/actions/donation";
import DonationRequestForm from "@/components/DonationRequestForm";
import { headers } from "next/headers";

const DonationRequestPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  if (!session?.user?.id || (session.user.role !== "USER" && session.user.role !== "ADMIN")) {
    redirect("/sign-in");
  }

  const donation = await getDonationCampaignById(id);

  if (!donation) {
    notFound();
  }

  // Check if donation is already completed
  if (donation.collected >= donation.target) {
    return (
      <div className="w-full">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Donation Completed</h1>
          <p className="text-gray-600 mb-8">
            This donation campaign has already reached its target. Thank you for your interest!
          </p>
          <Link
            href="/donate"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Browse Other Donations
          </Link>
        </div>
      </div>
    );
  }

  const [userData] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      phoneNumber: donatur.phoneNumber,
      city: donatur.city,
      state: donatur.state,
      zipCode: donatur.zipCode,
      address: donatur.address,
      latitude: donatur.latitude,
      longitude: donatur.longitude,
    })
    .from(users)
    .leftJoin(donatur, eq(donatur.userId, users.id))
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userData) {
    redirect("/sign-in");
  }

  const [institutionData] = await db
    .select({
      latitude: institutions.latitude,
      longitude: institutions.longitude,
    })
    .from(institutions)
    .where(eq(institutions.id, donation.institutionId))
    .limit(1);

  const userProfile = {
    id: userData.id,
    name: userData.fullName,
    phone: userData.phoneNumber ?? "",
    city: userData.city ?? "",
    state: userData.state ?? "",
    zipCode: userData.zipCode ?? "",
    address: userData.address ?? "",
    latitude: userData.latitude,
    longitude: userData.longitude,
  };

  return (
    <div className="w-full">
      <DonationRequestForm
        donation={donation}
        user={userProfile}
        institutionLocation={{
          latitude: institutionData?.latitude,
          longitude: institutionData?.longitude,
        }}
      />
    </div>
  );
};

export default DonationRequestPage;