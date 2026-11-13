"use client";

import Link from "next/link";
import Image from "next/image";
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
  drivingDistanceKm?: number | null;
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
  drivingDistanceKm,
  collected,
  target,
  userId,
}) => {
  const progress = target > 0 ? Math.min((collected / target) * 100, 100) : 0;
  const location = [institutionCity, institutionState].filter(Boolean).join(", ");
  const rawDistance = drivingDistanceKm ?? distanceKm;
  const displayDistance = rawDistance != null 
    ? Math.round( rawDistance * 100) / 100 
    : null;

  return (
    <div className="overflow-hidden rounded-sm border border-outline bg-white">
      {/* Cover image - clickable to view details */}
      <Link href={`/donations/${id}`} className="relative block h-28 w-full cursor-pointer overflow-hidden text-inherit no-underline sm:h-40 lg:h-50">
        {cover ? (
          <Image src={cover} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
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

      <div className="p-2 sm:p-3 lg:p-4">
        {/* Institution info */}
        <div className="mb-1.5 flex min-w-0 items-center gap-1.5 sm:mb-2 sm:gap-2">
          <div
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold sm:h-5 sm:w-5 sm:text-[10px] lg:h-6 lg:w-6 lg:text-xs"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-surface)",
            }}
          >
            {institutionName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-[9px] font-medium text-on-surface-variant sm:text-[11px] lg:text-sm">
            {institutionName}
          </span>
        </div>

        {/* Title - clickable to view details */}
        <Link href={`/donations/${id}`} className="mb-1 line-clamp-2 font-poppins text-[11px] leading-tight font-semibold text-on-surface transition-colors hover:text-primary text-inherit no-underline sm:text-sm lg:text-base">
          {title}
        </Link>

        {/* Location + Distance */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-1 sm:mb-3 sm:gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1 text-[8px] text-on-surface [&_svg]:h-3 [&_svg]:w-3 [&_svg]:shrink-0 sm:text-[11px] lg:text-[12.5px] [&_svg]:sm:h-3.5 [&_svg]:sm:w-3.5">
            <MapPin />
            <span className="truncate">{location || "Location not set"}</span>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-surface-container px-1.5 py-0.5 text-[8px] font-medium text-on-surface-variant sm:px-2.5 sm:text-[10px] lg:text-xs">
            {displayDistance != null ? `${displayDistance} km away` : "Distance unavailable"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-2 sm:mb-3 lg:mb-4">
          <div className="ml-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-container sm:h-2">
            <div
              className="relative h-full rounded-full bg-primary transition-[width] duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 ml-1 text-[9px] text-on-surface-variant sm:mt-1.5 sm:text-[11px] lg:text-[11px]">
            <strong>{collected}</strong> / {target} items collected
          </p>
        </div>

        {/* Donate Now Button */}
        {userId ? (
          <Link
            href={`/donations/${id}/request`}
            className="block w-full rounded-sm bg-primary px-1.5 py-1.5 text-center text-[9px] leading-tight font-semibold text-white no-underline transition-all hover:bg-primary-dark hover:-translate-y-px sm:px-4 sm:py-2.5 sm:text-xs lg:text-sm"
            style={{ width: "100%", textAlign: "center" }}
          >
            Donate Now
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="block w-full rounded-sm bg-primary px-1.5 py-1.5 text-center text-[9px] leading-tight font-semibold text-white no-underline transition-all hover:bg-primary-dark hover:-translate-y-px sm:px-4 sm:py-2.5 sm:text-xs lg:text-sm"
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