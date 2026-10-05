import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import DonationUploadForm from "@/components/institution/forms/DonationUploadForm";
import { headers } from "next/headers";

const NewDonationPage = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);
  const institutionId = session?.user?.id as string;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/institution/donations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back to Manage Donations</span>
          </Link>
          <h1 className="font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]">Add New Donation</h1>
          <p className="font-inter text-sm text-text-muted md:text-[15px]">
            Fill out the details below to create a new donation campaign.
          </p>
        </div>
      </div>

      <DonationUploadForm institutionId={institutionId} />
    </div>
  );
};

export default NewDonationPage;