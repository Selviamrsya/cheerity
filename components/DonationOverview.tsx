"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Truck } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

interface DonationOverviewProps {
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
  institutionZipCode: string | null;
  institutionAddress: string | null;
  institutionDescription: string | null;
  institutionWebsite: string | null;
  distanceKm?: number | null;
  drivingDistanceKm?: number | null;
  userId?: string | null;
}

const DonationOverview: React.FC<DonationOverviewProps> = ({
  id,
  title,
  category,
  cover,
  description,
  target,
  collected,
  deliveryMethods,
  hasPickupService,
  pickupMaxDistanceKm,
  institutionName,
  institutionCity,
  institutionState,
  institutionZipCode,
  institutionAddress,
  institutionDescription,
  institutionWebsite,
  distanceKm,
  drivingDistanceKm,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<"description" | "about">("description");
  const progress = target > 0 ? Math.min((collected / target) * 100, 100) : 0;
  const location = [institutionCity, institutionState].filter(Boolean).join(", ");
  const rawDistance = drivingDistanceKm ?? distanceKm;
  const displayDistance = rawDistance != null ? Math.round(rawDistance * 10) / 10 : null;
  return (
    <div className="flex w-full flex-col gap-4">
      {/* Back Button */}
      <Link
        href="/donate"
        className="flex items-center gap-2 text-sm font-medium text-gray-600 mt-12 md:mt-16 hover:text-green-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Donations
      </Link>

      <section className="mt-4 flex w-full flex-col gap-4 md:flex-row md:p-0 md:mt-4">
        {/* Cover image with category badge */}
        <div className="relative h-[250px] w-full shrink-0 overflow-hidden rounded-sm bg-gray-100 md:h-[280px] md:w-[320px]">
          {cover ? (
            <img src={cover} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-green-50">
              <Package className="h-18 w-18" style={{ color: "var(--color-surface)" }} />
            </div>
          )}
          {/* Category badge overlaid top-left */}
          <span className="absolute top-5 left-[18px] rounded-full bg-primary-800/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
            {CATEGORY_LABELS[category] ?? category}
          </span>
        </div>

        {/* Info panel beside cover */}
        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

          {/* Institution */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-surface">
              {institutionName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-700">{institutionName}</span>
          </div>

          {/* Location + distance */}
          <div className="ml-0.5 flex items-center gap-1 text-[13px] text-gray-600">
            <MapPin className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
            <span>{location || "Location not set"}</span>
            {displayDistance != null && (
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">{displayDistance} km away</span>
            )}
          </div>

          {/* Pickup info */}
          {hasPickupService && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700">
              <Truck className="h-3.5 w-3.5" />
              <span>
                Pickup available
                {pickupMaxDistanceKm ? ` (up to ${pickupMaxDistanceKm} km)` : ""}
              </span>
            </div>
          )}

          {/* Progress */}
          <div className="mb-4" style={{ marginBottom: 0 }}>
            <div className="ml-1 h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="relative h-full rounded-full bg-primary transition-[width] duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 ml-1 text-[13px] text-on-surface-variant">
              <strong>{collected}</strong> / {target} items collected
            </p>
          </div>

          {/* Delivery methods */}
          <div className="ml-1">
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>
              Delivery Methods
            </p>
            <div className="flex flex-wrap gap-2">
              {deliveryMethods.map((m) => (
                <span key={m} className="mt-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  {DELIVERY_METHOD_LABELS[m] ?? m}
                </span>
              ))}
            </div>
          </div>

          {/* Donate Now Button */}
          {userId ? (
            <Link
              href={`/donations/${id}/request`}
              className="mt-3 block w-full rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-all hover:bg-primary-dark hover:-translate-y-px"
              style={{ marginTop: "6px" }}
            >
              Donate Now
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="mt-3 block w-full rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-all hover:bg-primary-dark hover:-translate-y-px"
              style={{ marginTop: "16px" }}
            >
              Sign In to Donate
            </Link>
          )}
        </div>
      </section>

      {/* Tabs Section */}
      <div>
        <div className="flex border-b border-gray-200 gap-4">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === "description"
              ? "text-green-800 border-green-800"
              : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === "about"
              ? "text-green-800 border-green-800"
              : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
          >
            About Us
          </button>
        </div>

        <div className="py-3 rounded-sm h-48 overflow-y-auto">
          {activeTab === "description" ? (
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {description || "No description provided for this donation campaign."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {institutionDescription || "No information available about this institution."}
                </p>
              </div>

              {/* Institution Address Section */}
              {(institutionAddress || institutionCity || institutionState || institutionZipCode) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold font-poppins text-gray-900 text-sm mb-3">Institution Address</h4>
                  <div className="bg-gray-50 rounded-sm p-4 space-y-2">
                    {institutionAddress && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 font-medium text-sm w-28 flex-shrink-0">Street Address</span>
                        <span className="text-gray-400">:</span>
                        <span className="font-semibold text-gray-900 text-sm break-words">{institutionAddress}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium text-sm w-28 flex-shrink-0">City</span>
                      <span className="text-gray-400">:</span>
                      <span className="font-semibold text-gray-900 text-sm">{institutionCity || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium text-sm w-28 flex-shrink-0">State/Province</span>
                      <span className="text-gray-400">:</span>
                      <span className="font-semibold text-gray-900 text-sm">{institutionState || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium text-sm w-28 flex-shrink-0">ZIP Code</span>
                      <span className="text-gray-400">:</span>
                      <span className="font-semibold text-gray-900 text-sm">{institutionZipCode || "-"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Institution Social Media */}
              {institutionWebsite && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium text-sm">Institution social media</span>
                    <span className="text-gray-400">:</span>
                    <a
                      href={institutionWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:text-green-900 font-medium underline cursor-pointer"
                    >
                      {institutionWebsite}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationOverview;