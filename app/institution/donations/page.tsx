import React from "react";
import { getSession } from "@/lib/auth";
import { getInstitutionDonations } from "@/lib/actions/donation";
import ManageDonationsClient from "./ManageDonationsClient";
import { headers } from "next/headers";

const ManageDonationsPage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);
  const institutionId = session?.user?.id as string;

  const donations = await getInstitutionDonations(institutionId);

  // Format dates consistently to prevent hydration errors
  const formattedDonations = donations.map((d) => ({
    ...d,
    createdAt: d.createdAt ? d.createdAt.toISOString() : null,
    status: d.status || "ACTIVE",
    hasPickupService: d.hasPickupService ?? false,
  }));

  return <ManageDonationsClient donations={formattedDonations} />;
};

export default ManageDonationsPage;