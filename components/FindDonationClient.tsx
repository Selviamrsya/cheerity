"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import DonationCard from "@/components/DonationCard";
import { getDonationsWithDistance } from "@/lib/actions/donation";
import { DONATION_CATEGORIES, DISTANCE_FILTERS } from "@/constants";

interface Donation {
  id: string;
  title: string;
  category: string;
  cover: string | null;
  target: number;
  collected: number;
  institutionName: string;
  institutionCity: string | null;
  institutionState: string | null;
  distanceKm: number | null;
}

interface FindDonationClientProps {
  initialDonations: Donation[];
  userLat: number | null;
  userLng: number | null;
}

const FindDonationClient: React.FC<FindDonationClientProps> = ({
  initialDonations,
  userLat,
  userLng,
}) => {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = donations.filter((d) => {
    const matchSearch =
      search === "" ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.institutionName.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const refetch = async (cat: string, dist?: number) => {
    setIsLoading(true);
    const results = await getDonationsWithDistance({
      userLat,
      userLng,
      category: cat || undefined,
      maxDistanceKm: dist,
      limit: 50,
    });
    setDonations(results as Donation[]);
    setIsLoading(false);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    refetch(val, maxDistance);
  };

  const handleDistanceChange = (val: string) => {
    const dist = val ? Number(val) : undefined;
    setMaxDistance(dist);
    refetch(category, dist);
  };

  return (
    <div>
      {/* Page header */}
      <div className="find-donation-header">
        <h1 className="find-donation-title">Find a Donation</h1>
        <p className="find-donation-subtitle">
          Browse donation campaigns from verified institutions near you.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="find-donation-filters">
        {/* Search */}
        <div className="find-donation-search">
          <Search className="h-4 w-4" style={{ color: "var(--color-on-surface-variant)" }} />
          <input
            type="text"
            placeholder="Search donations or institutions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="find-donation-search-input"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="find-donation-select"
        >
          <option value="">All Categories</option>
          {DONATION_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Distance filter */}
        <select
          value={maxDistance ?? ""}
          onChange={(e) => handleDistanceChange(e.target.value)}
          className="find-donation-select"
        >
          <option value="">Any Distance</option>
          {DISTANCE_FILTERS.map((d) => (
            <option key={d.value} value={d.value}>
              Within {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="find-donation-count">
        {isLoading ? "Loading..." : `${filtered.length} donation${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Donation grid */}
      {filtered.length === 0 && !isLoading ? (
        <div className="find-donation-empty">
          <p>No donations found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="donation-grid">
          {filtered.map((donation, index) => (
            <div key={donation.id} className={`fade-in stagger-${(index % 3) + 1}`}>
              <DonationCard
                id={donation.id}
                title={donation.title}
                institutionName={donation.institutionName}
                cover={donation.cover}
                institutionCity={donation.institutionCity}
                institutionState={donation.institutionState}
                distanceKm={donation.distanceKm}
                collected={donation.collected}
                target={donation.target}
                category={donation.category}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindDonationClient;
