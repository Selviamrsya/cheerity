import React from "react";
import { getSession } from "@/lib/auth";
import { getInstitutionDonationHistory } from "@/lib/actions/donation";
import InstitutionHistoryClient from "@/components/InstitutionHistoryClient";
import { headers } from "next/headers";

const InstitutionHistoryPage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);
  const institutionId = session?.user?.id as string;

  const records = await getInstitutionDonationHistory(institutionId);

  return (
    <div className="space-y-2">
      <InstitutionHistoryClient
        records={records}
      />
    </div>
  );
};

export default InstitutionHistoryPage;
