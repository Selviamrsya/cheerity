import React from "react";
import { auth } from "@/app/auth";
import { getInstitutionDonationHistory } from "@/lib/actions/donation";
import InstitutionHistoryClient from "@/components/InstitutionHistoryClient";

const InstitutionHistoryPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  const records = await getInstitutionDonationHistory(institutionId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <InstitutionHistoryClient
        institutionId={institutionId}
        records={records}
      />
    </div>
  );
};

export default InstitutionHistoryPage;
