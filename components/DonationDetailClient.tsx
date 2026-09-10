"use client";

import React, { useState } from "react";
import DonationOverview from "@/components/DonationOverview";

interface DonationDetailClientProps {
  donation: {
    id: string;
    title: string;
    category: string;
    cover: string | null;
    description: string | null;
    target: number;
    collected: number;
    deliveryMethods: string[];
    hasPickupService: boolean | null;
    pickupMaxDistanceKm: number | null;
    institutionId: string;
    institutionName: string;
    institutionCity: string | null;
    institutionState: string | null;
    institutionDescription: string | null;
    institutionWebsite: string | null;
    distanceKm?: number | null;
  };
  user: {
    id: string;
    name: string;
    phone: string;
    city: string;
    state: string;
    zipCode: string;
    address: string;
  } | null;
}

const DonationDetailClient: React.FC<DonationDetailClientProps> = ({
  donation,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<"description" | "about_us">("description");

  return (
    <div className="w-full space-y-8">
      {/* Top Banner / Overview */}
      <DonationOverview
        {...donation}
        userId={user?.id ?? null}
      />

      {/* Tabs: Description & About Us */}
      <div className="donation-detail-tabs-section">
        <div className="donation-detail-tabs-content">
          <div className="flex border-b border-gray-200 gap-8 mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-base font-semibold transition-colors relative ${
                activeTab === "description"
                  ? "text-green-800 border-b-2 border-green-800"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("about_us")}
              className={`pb-3 text-base font-semibold transition-colors relative ${
                activeTab === "about_us"
                  ? "text-green-800 border-b-2 border-green-800"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              About Us
            </button>
          </div>

          {/* Tab Content */}
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {activeTab === "description" ? (
              donation.description || "No description provided for this donation campaign."
            ) : (
              <div className="space-y-4">
                <p>{donation.institutionDescription || "No information available about this institution."}</p>
                {donation.institutionWebsite && (
                  <div className="pt-2">
                    <span className="font-semibold text-gray-900">Website / Social: </span>
                    <a
                      href={donation.institutionWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline"
                    >
                      {donation.institutionWebsite}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetailClient;
