import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getInstitutionDonationHistory } from "@/lib/actions/donation";
import InstitutionHistoryClient from "@/components/InstitutionHistoryClient";
import { headers } from "next/headers";

const InstitutionHistoryPage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  if (!session?.user?.id || session.user.role !== "INSTITUTION") {
    redirect("/sign-in");
  }

  const records = await getInstitutionDonationHistory(session.user.id);

  return (
    <div className="space-y-2">
      <InstitutionHistoryClient
        records={records}
      />
    </div>
  );
};

export default InstitutionHistoryPage;
