"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import React from "react";

interface DonationCardProps {
  id: string;
  title: string;
  institutionName: string;
  cover: string | null;
  institutionCity: string | null;
  institutionState: string | null;
  distanceKm: number | null;
  collected: number;
  target: number;
  category: string;
  userId?: string | null;
}

const DonationCard: React.FC<DonationCardProps> = ({
  id,
  title,
  institutionName,
  cover,
  institutionCity,
  institutionState,
  distanceKm,
  collected,
  target,
  userId,
}) => {
  const progress = target > 0 ? Math.min((collected / target) * 100, 100) : 0;
  const location = [institutionCity, institutionState].filter(Boolean).join(", ");

  return (
    <div className="overflow-hidden rounded-sm border border-outline bg-white">
      {/* Cover image - clickable to view details */}
      <Link href={`/donations/${id}`} className="relative h-50 w-full cursor-pointer overflow-hidden block text-inherit no-underline">
        {cover ? (
          <img src={cover} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "var(--color-primary-50)" }}
          >
            <span style={{ color: "var(--color-surface)", fontSize: 40 }}>
              &#9673;
            </span>
          </div>
        )}
      </Link>

      <div className="p-4">
        {/* Institution info */}
        <div className="mb-2 flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              width: 24,
              height: 24,
              background: "var(--color-primary)",
              color: "var(--color-surface)",
              flexShrink: 0,
            }}
          >
            {institutionName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-on-surface-variant">
            {institutionName}
          </span>
        </div>

        {/* Title - clickable to view details */}
        <Link href={`/donations/${id}`} className="mb-1 line-clamp-2 font-poppins text-base leading-snug font-semibold text-on-surface transition-colors hover:text-primary text-inherit no-underline">
          {title}
        </Link>

        {/* Location + Distance */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[12.5px] text-on-surface [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:shrink-0">
            <MapPin />
            <span>{location || "Location not set"}</span>
          </div>
          <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
            {distanceKm != null ? `${distanceKm} km away` : "Distance unavailable"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
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

        {/* Donate Now Button */}
        {userId ? (
          <Link
            href={`/donations/${id}/request`}
            className="block w-full rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-all hover:bg-primary-dark hover:-translate-y-px"
            style={{ width: "100%", textAlign: "center" }}
          >
            Donate Now
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="block w-full rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-all hover:bg-primary-dark hover:-translate-y-px"
            style={{width: "100%", textAlign: "center" }}
          >
            Sign In to Donate
          </Link>
        )}
      </div>
    </div>
  );
};

export default DonationCard;