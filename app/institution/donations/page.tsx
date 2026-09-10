import React from "react";
import { auth } from "@/app/auth";
import { getInstitutionDonations } from "@/lib/actions/donation";
import ManageDonationsClient from "./ManageDonationsClient";

const ManageDonationsPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  const donations = await getInstitutionDonations(institutionId);

  // Format dates consistently to prevent hydration errors
  const formattedDonations = donations.map((d) => ({
    ...d,
    createdAt: d.createdAt ? d.createdAt.toISOString() : null,
  }));

  return <ManageDonationsClient donations={formattedDonations} />;
};

export default ManageDonationsPage;