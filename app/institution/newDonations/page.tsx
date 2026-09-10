import React from "react";
import Link from "next/link";
import { auth } from "@/app/auth";
import { ArrowLeft } from "lucide-react";
import DonationUploadForm from "@/components/institution/forms/DonationUploadForm";

const NewDonationPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  return (
    <div className="space-y-8">
      <div className="institution-header">
        <div>
          <Link
            href="/institution/donations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back to Manage Donations</span>
          </Link>
          <h1 className="institution-title">Add New Donation</h1>
          <p className="institution-subtitle">
            Fill out the details below to create a new donation campaign.
          </p>
        </div>
      </div>

      <DonationUploadForm institutionId={institutionId} />
    </div>
  );
};

export default NewDonationPage;