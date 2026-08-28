import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import React from "react";

interface DonationCardProps {
  id: string;
  title: string;
  institutionName: string;
  institutionLogo: string;
  coverImage: string;
  location: string;
  distance: string;
  currentAmount: number;
  targetAmount: number;
}

const DonationCard: React.FC<DonationCardProps> = ({
  id,
  title,
  institutionName,
  institutionLogo,
  coverImage,
  location,
  distance,
  currentAmount,
  targetAmount,
}) => {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);

  return (
    <div className="donation-card">
      {/* Cover Image */}
      <div className="donation-card_cover">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="donation-card_body">
        {/* Institution info */}
        <div className="donation-card_institution">
          <Image
            src={institutionLogo}
            alt={institutionName}
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
          <span>{institutionName}</span>
        </div>

        {/* Title */}
        <h3 className="donation-card_title">{title}</h3>

        {/* Location + Distance */}
        <div className="donation-card_location">
          <div className="donation-card_location-left">
            <MapPin />
            <span>{location}</span>
          </div>
          <span className="donation-card_distance">{distance}</span>
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
            <strong>{currentAmount}</strong> / {targetAmount} items
          </p>
        </div>

        {/* Donate Now Button */}
        <Link href={`/donate/${id}`} className="donation-card_btn">
          Donate Now
        </Link>
      </div>
    </div>
  );
};

export default DonationCard;