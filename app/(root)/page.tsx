import React from "react";
import { auth } from "@/app/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getDonationsWithDistance } from "@/lib/actions/donation";
import DonationCard from "@/components/DonationCard";
import Link from "next/link";

const Home = async () => {
  const session = await auth();

  // Get user's lat/lng for distance calculation
  let userLat: number | null = null;
  let userLng: number | null = null;

  if (session?.user?.id && session.user.role === "USER") {
    const [userData] = await db
      .select({ latitude: users.latitude, longitude: users.longitude })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    userLat = userData?.latitude ?? null;
    userLng = userData?.longitude ?? null;
  }

  const donations = await getDonationsWithDistance({
    userLat,
    userLng,
    limit: 3,
  });

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            Give a Box,<br />Light a Future
          </h1>
          <p className="hero-subtitle">
            Connect your unused belongings with people who truly need them.
            Every donation makes a difference.
          </p>
          <Link href="/donate" className="hero-cta">
            Find a Donation
          </Link>
        </div>
      </section>

      {/* Discover Donations Section */}
      <section style={{ marginBottom: "64px" }}>
        <div className="section-header">
          <h2 className="section-title">
            Discover Donations Inspired by What You Care About
          </h2>
          <p className="section-subtitle">
            Browse active campaigns from verified institutions near you.
          </p>
        </div>

        {donations.length === 0 ? (
          <p className="text-center" style={{ color: "var(--color-on-surface-variant)" }}>
            No active donation campaigns yet. Check back soon!
          </p>
        ) : (
          <div className="donation-grid">
            {donations.map((donation, index) => (
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

        <div className="text-center mt-8">
          <Link href="/donate" className="btn-primary" style={{ width: "auto", display: "inline-flex", padding: "12px 32px" }}>
            See All Donations
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;