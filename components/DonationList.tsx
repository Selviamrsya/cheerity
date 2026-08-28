import DonationCard from "./DonationCard";
import React from "react";

interface Donation {
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

interface DonationListProps {
  title: string;
  subtitle?: string;
  donations: Donation[];
  className?: string;
}

const DonationList: React.FC<DonationListProps> = ({
  title,
  subtitle,
  donations,
  className = "",
}) => {
  return (
    <section className={className}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      <div className="donation-grid">
        {donations.map((donation, index) => (
          <div
            key={donation.id}
            className={`fade-in stagger-${(index % 3) + 1}`}
          >
            <DonationCard {...donation} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DonationList;