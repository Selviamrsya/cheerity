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
    <section className="donation-overview-section">
      {/* Cover image with category badge */}
      <div className="donation-overview-cover">
        {cover ? (
          <img src={cover} alt={title} className="donation-overview-img" />
        ) : (
          <div className="donation-overview-placeholder">
            <Package className="h-16 w-16" style={{ color: "var(--color-primary-200)" }} />
          </div>
        )}
        {/* Category badge overlaid top-left */}
        <span className="donation-overview-category-badge">
          {CATEGORY_LABELS[category] ?? category}
        </span>
      </div>

      {/* Info panel beside cover */}
      <div className="donation-overview-info">
        <h1 className="donation-overview-title">{title}</h1>

        {/* Institution */}
        <div className="donation-overview-institution">
          <div className="donation-overview-institution-avatar">
            {institutionName.charAt(0).toUpperCase()}
          </div>
          <span className="donation-overview-institution-name">{institutionName}</span>
        </div>

        {/* Location + distance */}
        <div className="donation-overview-location">
          <MapPin className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
          <span>{location || "Location not set"}</span>
          {distanceKm != null && (
            <span className="donation-card_distance">{distanceKm} km away</span>
          )}
        </div>

        {/* Pickup info */}
        {hasPickupService && (
          <div className="pickup-badge">
            <Truck className="h-3.5 w-3.5" />
            <span>
              Pickup available
              {pickupMaxDistanceKm ? ` (up to ${pickupMaxDistanceKm} km)` : ""}
            </span>
          </div>
        )}

        {/* Progress */}
        <div className="donation-card_progress" style={{ marginBottom: 0 }}>
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

        {/* Delivery methods */}
        <div className="donation-overview-delivery">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>
            Delivery Methods
          </p>
          <div className="flex flex-wrap gap-2">
            {deliveryMethods.map((m) => (
              <span key={m} className="delivery-badge">
                {DELIVERY_METHOD_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        </div>

        {/* Donate button */}
        {userId ? (
          <Link href={`/donations/${id}/request`} className="btn-primary" style={{ marginTop: 8 }}>
            Donate Now
          </Link>
        ) : (
          <Link href="/sign-in" className="btn-primary" style={{ marginTop: 8 }}>
            Sign In to Donate
          </Link>
        )}
      </div>
    </section>
  );
};

export default DonationOverview;