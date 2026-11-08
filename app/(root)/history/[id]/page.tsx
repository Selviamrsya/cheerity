import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDonationRecordById } from "@/lib/actions/donation";
import DonationDetailClient from "@/components/DonationDetailClient";
import { headers } from "next/headers";

const DonationDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const record = await getDonationRecordById(id);

  if (!record) {
    redirect("/history");
  }

  // Verify user owns this record
  if (record.userId !== session.user.id) {
    redirect("/history");
  }

  return (
    <div className="mx-auto w-full max-w-330 px-8 pb-10 pt-15 md:pb-14">
      <DonationDetailClient record={record} userType="user" />
    </div>
  );
};

export default DonationDetailPage;
