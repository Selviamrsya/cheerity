import React from "react";
import { auth } from "@/app/auth";
import { getInstitutionDonationHistory } from "@/lib/actions/donation";
import InstitutionHistoryClient from "@/components/InstitutionHistoryClient";

const InstitutionHistoryPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  const records = await getInstitutionDonationHistory(institutionId);

  return (
    <div className="space-y-8">
      <InstitutionHistoryClient
        institutionId={institutionId}
        records={records}
      />
    </div>
  );
};

export default InstitutionHistoryPage;
