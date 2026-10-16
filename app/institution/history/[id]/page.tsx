import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDonationRecordById } from "@/lib/actions/donation";
import DonationDetailClient from "@/components/DonationDetailClient";
import { headers } from "next/headers";

// Definisikan tipe PageProps secara presisi untuk Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
const Page = async ({ params }: PageProps) => {
  // 2. Unwarp / await params sebelum mengambil id
  const { id: donationId } = await params;

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

export default Page;