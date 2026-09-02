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
}) => {
  const progress = target > 0 ? Math.min((collected / target) * 100, 100) : 0;
  const location = [institutionCity, institutionState].filter(Boolean).join(", ");

  return (
    <Link href={`/donations/${id}`} className="donation-card block text-inherit no-underline">
      {/* Cover image */}
      <div className="donation-card_cover">
        {cover ? (
          <img src={cover} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "var(--color-primary-50)" }}
          >
            <span style={{ color: "var(--color-primary-200)", fontSize: 40 }}>
              &#9673;
            </span>
          </div>
        )}
      </div>

      <div className="donation-card_body">
        {/* Institution info */}
        <div className="donation-card_institution">
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              width: 28,
              height: 28,
              background: "var(--color-primary-100)",
              color: "var(--color-primary)",
              flexShrink: 0,
            }}
          >
            {institutionName.charAt(0).toUpperCase()}
          </div>
          <span>{institutionName}</span>
        </div>

        {/* Title */}
        <h3 className="donation-card_title">{title}</h3>

        {/* Location + Distance */}
        <div className="donation-card_location">
          <div className="donation-card_location-left">
            <MapPin />
            <span>{location || "Location not set"}</span>
          </div>
          <span className="donation-card_distance">
            {distanceKm != null ? `${distanceKm} km away` : "N/A"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="donation-card_progress">
          <div className="donation-card_progress-bar">
            <div
              className="donation-card_progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="donation-card_progress-text">
            <strong>{collected}</strong> / {target} items collected
          </p>
        </div>

        {/* Donate button span */}
        <span className="donation-card_btn inline-block text-center w-full">
          Donate Now
        </span>
      </div>
    </Link>
  );
};

export default DonationCard;