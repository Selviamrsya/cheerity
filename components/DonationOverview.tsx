import React from "react";
import Link from "next/link";
import { MapPin, Package, Truck } from "lucide-react";
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
  institutionDescription: string | null;
  institutionWebsite: string | null;
  distanceKm?: number | null;
  userId?: string | null;
}

const DonationOverview: React.FC<DonationOverviewProps> = ({
  id,
  title,
  category,
  cover,
  description: _description,
  target,
  collected,
  deliveryMethods,
  hasPickupService,
  pickupMaxDistanceKm,
  institutionName,
  institutionCity,
  institutionState,
  institutionDescription: _institutionDescription,
  institutionWebsite: _institutionWebsite,
  distanceKm,
  userId,
}) => {
  const progress = target > 0 ? Math.min((collected / target) * 100, 100) : 0;
  const location = [institutionCity, institutionState].filter(Boolean).join(", ");

  return (
    <section className="mt-18 flex w-full flex-col gap-4 p-2 md:flex-row md:p-0">
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
        <span className="absolute top-5 left-[18px] rounded-full bg-primary-800/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-[4px]">
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
          {distanceKm != null && (
            <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">{distanceKm} km away</span>
          )}
        </div>

        {/* Pickup info */}
        {hasPickupService && (
          <div className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700">
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
  );
};

export default DonationOverview;