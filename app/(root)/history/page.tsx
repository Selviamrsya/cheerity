import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserDonationHistory } from "@/lib/actions/donation";
import UserHistoryClient from "@/components/UserHistoryClient";
import { headers } from "next/headers";

const HistoryPage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const records = await getUserDonationHistory(session.user.id);

  return (
    <div className="mx-auto w-full max-w-330 px-8 pb-10 pt-8 md:px-32 md:pb-14 md:pt-12">
      <UserHistoryClient records={records} />
    </div>
  );
};

export default HistoryPage;
