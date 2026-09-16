import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { getUserDonationHistory } from "@/lib/actions/donation";
import UserHistoryClient from "@/components/UserHistoryClient";

const HistoryPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const records = await getUserDonationHistory(session.user.id);

  return (
    <div className="user-page-container">
      <UserHistoryClient records={records} />
    </div>
  );
};

export default HistoryPage;
