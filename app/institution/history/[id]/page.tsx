// File: C:\Users\Lenovo\Desktop\Next\cheerity\app\institution\history\[id]\page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDonationRecordById } from "@/lib/actions/donation";
import DonationDetailClient from "@/components/DonationDetailClient";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ id: string }>;
}

const InstitutionDonationDetailPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const donationId = resolvedParams.id;

  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const record = await getDonationRecordById(donationId);

  if (!record) {
    redirect("/institution/history");
  }

  return (
    <div className="mx-auto w-full max-w-330 px-8 pb-10 pt-8 md:pb-14">
      <DonationDetailClient record={record} userType="institution" />
    </div>
  );
};

export default InstitutionDonationDetailPage;