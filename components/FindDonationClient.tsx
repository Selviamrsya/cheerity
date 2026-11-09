"use client";

import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
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
  drivingDistanceKm?: number | null;
}

interface FindDonationClientProps {
  initialDonations: Donation[];
  userLat: number | null;
  userLng: number | null;
  userId?: string | null;
}

const FindDonationClient: React.FC<FindDonationClientProps> = ({
  initialDonations,
  userLat,
  userLng,
  userId,
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
    // Use driving distance for filtering if available, otherwise fallback to straight-line distance
    const effectiveDistance = d.drivingDistanceKm ?? d.distanceKm;
    const matchDistance =
      maxDistance === undefined ||
      effectiveDistance === null ||
      effectiveDistance <= maxDistance;
    return matchSearch && matchDistance;
  }).sort((a, b) => {
    // Sort by driving distance if available, otherwise by straight-line distance
    const aDist = a.drivingDistanceKm ?? a.distanceKm;
    const bDist = b.drivingDistanceKm ?? b.distanceKm;
    if (aDist === null && bDist === null) return 0;
    if (aDist === null) return 1;
    if (bDist === null) return -1;
    return aDist - bDist;
  });

  const refetch = async (cat: string, dist?: number) => {
    setIsLoading(true);
    const results = await getDonationsWithDistance({
      userLat,
      userLng,
      category: cat || undefined,
      maxDistanceKm: dist,
      limit: 20,
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
    <div className="w-full">
      {/* Page header */}
      <div className="mt-2 mb-3">
        <h1 className="font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]">Find a Donation</h1>
        <p className="max-w-140 text-[15px] text-on-surface-variant">
          Browse donation campaigns from verified institutions near you.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mt-2 mb-4 flex flex-wrap gap-2">
        {/* Search */}
        <div className="flex min-w-[120px] md:min-w-[240px] flex-1 items-center gap-1.5 rounded-sm border border-outline bg-white px-3.5">
          <Search className="h-4 w-4" style={{ color: "var(--color-on-surface-variant)" }} />
          <input
            type="text"
            placeholder="Search donations or institutions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-none py-2.5 text-sm outline-none bg-transparent"
          />
        </div>

        {/* Category filter */}
        <div className="relative flex items-center">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="cursor-pointer appearance-none rounded-sm border border-outline bg-white py-2.5 pr-10 pl-3.5 text-sm text-on-surface outline-none transition-colors hover:border-slate-300 focus:border-primary w-auto"
          >
            <option value="">All Categories</option>
            {DONATION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3.5 h-4 w-4 pointer-events-none"
            style={{ color: "var(--color-on-surface-variant)" }}
          />
        </div>

        {/* Distance filter */}
        <div className="relative flex items-center">
          <select
            value={maxDistance ?? ""}
            onChange={(e) => handleDistanceChange(e.target.value)}
            className="cursor-pointer appearance-none rounded-sm border border-outline bg-white py-2.5 pr-10 pl-3.5 text-sm text-on-surface outline-none transition-colors hover:border-slate-300 focus:border-primary w-auto"
          >
            <option value="">Any Distance</option>
            {DISTANCE_FILTERS.map((d) => (
              <option key={d.value} value={d.value}>
                Within {d.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3.5 h-4 w-4 pointer-events-none"
            style={{ color: "var(--color-on-surface-variant)" }}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="mb-1 text-sm text-gray-500">
        {isLoading ? "Loading..." : `${filtered.length} donation${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Donation grid */}
      {filtered.length === 0 && !isLoading ? (
        <div className="py-12 text-center text-gray-500">
          <p>No donations found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {filtered.map((donation, index) => (
            <div key={donation.id} className={`animate-fade-in stagger-${(index % 4) + 1}`}>
              <DonationCard
                id={donation.id}
                title={donation.title}
                institutionName={donation.institutionName}
                cover={donation.cover}
                institutionCity={donation.institutionCity}
                institutionState={donation.institutionState}
                distanceKm={donation.distanceKm}
                drivingDistanceKm={donation.drivingDistanceKm}
                collected={donation.collected}
                target={donation.target}
                category={donation.category}
                userId={userId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindDonationClient;
