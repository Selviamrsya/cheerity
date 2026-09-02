import React from "react";
import Link from "next/link";
import { auth } from "@/app/auth";
import { ArrowLeft } from "lucide-react";
import DonationUploadForm from "@/components/institution/forms/DonationUploadForm";

const NewDonationPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/institution/donations"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go back to Manage Donations</span>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Donation</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill out the details below to create a new donation campaign.
        </p>
      </div>

      <DonationUploadForm institutionId={institutionId} />
    </div>
  );
};

export default NewDonationPage;