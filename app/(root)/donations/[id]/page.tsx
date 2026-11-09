import React from "react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { institutions, donations, donatur } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import DonationOverview from "@/components/DonationOverview";
import { headers } from "next/headers";
import { fetchSingleRoute } from "@/lib/utils/osrm";

// Extend getDonationCampaignById to include institution description and website
const getDonationCampaignWithInstitutionInfo = async (id: string) => {
  try {
    const [campaign] = await db
      .select({
        id: donations.id,
        title: donations.title,
        description: donations.description,
        category: donations.category,
        cover: donations.cover,
        target: donations.target,
        collected: donations.collected,
        deliveryMethods: donations.deliveryMethods,
        hasPickupService: donations.hasPickupService,
        pickupMaxDistanceKm: donations.pickupMaxDistanceKm,
        status: donations.status,
        institutionId: donations.institutionId,
        institutionName: institutions.institutionName,
        institutionCity: institutions.city,
        institutionState: institutions.state,
        institutionZipCode: institutions.zipCode,
        institutionAddress: institutions.address,
        institutionDescription: institutions.description,
        institutionWebsite: institutions.websiteOrSocial,
      })
      .from(donations)
      .innerJoin(institutions, eq(donations.institutionId, institutions.id))
      .where(eq(donations.id, id))
      .limit(1);

    return campaign ?? null;
  } catch (error) {
    console.error("Error fetching donation campaign with institution info:", error);
    return null;
  }
};

const DonationDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  const campaign = await getDonationCampaignWithInstitutionInfo(id);

  if (!campaign) {
    notFound();
  }

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

  // Calculate distance if user has location
  let distanceKm: number | null = null;
  let drivingDistanceKm: number | null = null;
  if (userLat != null && userLng != null && campaign.institutionId) {
    // Get institution location from institutions table
    const [institutionData] = await db
      .select({ latitude: institutions.latitude, longitude: institutions.longitude })
      .from(institutions)
      .where(eq(institutions.id, campaign.institutionId))
      .limit(1);

    if (institutionData?.latitude != null && institutionData?.longitude != null) {
      // Calculate Haversine (straight-line) distance
      const R = 6371; // Earth's radius in km
      const dLat = (institutionData.latitude - userLat) * (Math.PI / 180);
      const dLon = (institutionData.longitude - userLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLat * (Math.PI / 180)) *
        Math.cos(institutionData.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm = Math.round(R * c * 10) / 10;

      // Try to fetch driving distance from OSRM
      drivingDistanceKm = await fetchSingleRoute(
        userLat,
        userLng,
        institutionData.latitude,
        institutionData.longitude
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-345 px-4 pb-10 sm:px-8 md:px-32 md:pb-14">
      <DonationOverview
        id={campaign.id}
        title={campaign.title}
        category={campaign.category}
        cover={campaign.cover}
        description={campaign.description}
        target={campaign.target}
        collected={campaign.collected}
        deliveryMethods={campaign.deliveryMethods}
        hasPickupService={campaign.hasPickupService}
        pickupMaxDistanceKm={campaign.pickupMaxDistanceKm}
        institutionId={campaign.institutionId}
        institutionName={campaign.institutionName}
        institutionCity={campaign.institutionCity}
        institutionState={campaign.institutionState}
        institutionZipCode={campaign.institutionZipCode}
        institutionAddress={campaign.institutionAddress}
        institutionDescription={campaign.institutionDescription}
        institutionWebsite={campaign.institutionWebsite}
        distanceKm={distanceKm}
        drivingDistanceKm={drivingDistanceKm}
        userId={session?.user?.id ?? null}
      />
    </div>
  );
};

export default DonationDetailPage;