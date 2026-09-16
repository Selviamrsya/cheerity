import React from "react";
import Image from "next/image";
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

  if (session?.user?.id && (session.user.role === "USER" || session.user.role === "ADMIN")) {
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
    limit: 4,
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

      {/* Roles description section */}
      <section className="role-description">
        <div className="roleDescription-header">
          <h2 className="roleDescription-title">
            One platform, Two ways to make an impact
          </h2>
          <p className="roleDescription-subtitle">
            A simple way to connect generosity with real needs. Whether you&apos;re looking to donate usable items or represent an organization seeking support.
          </p>
        </div>

        <div className="role-cards-grid">
          {/* Card 1: Donate */}
          <div className="role-card">
            <Image
              src="/assets/donate.png"
              alt="Donate"
              width={56}
              height={56}
              className="role-card-img"
            />
            <div className="role-card-content">
              <h3 className="role-card-title">Donate</h3>
              <p className="role-card-text">
                Give unused but valuable items a new purpose by donating them to people who can benefit from them
              </p>
            </div>
          </div>

          {/* Card 2: Distribute */}
          <div className="role-card">
            <Image
              src="/assets/distribute.png"
              alt="Distribute"
              width={56}
              height={56}
              className="role-card-img"
            />
            <div className="role-card-content">
              <h3 className="role-card-title">Distribute</h3>
              <p className="role-card-text">
                Help registered institutions and social communities receive and distribute essential supplies directly to people in need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Donations Section */}
      <section className="discover-donations-section">
        <div className="section-header">
          <h2 className="section-title">
            Discover Donations Inspired by What You Care About
          </h2>
        </div>

        {donations.length === 0 ? (
          <p className="text-center" style={{ color: "var(--color-on-surface-variant)" }}>
            No active donation campaigns yet. Check back soon!
          </p>
        ) : (
          <div className="donation-grid">
            {donations.map((donation, index) => (
              <div key={donation.id} className={`fade-in stagger-${(index % 4) + 1}`}>
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
                  userId={session?.user?.id ?? null}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/donate" className="btn-primary" style={{ width: "auto", display: "inline-flex", padding: "12px 32px", margin:"20px 42px" }}>
            See All Donations
          </Link>
        </div>
      </section>

  {/* How it works section */}
    <section className="tutorial-section">
      <h2 className="tutorial-title">
        How it works
      </h2>
      <div className="tutorial-cards-grid">
        <div className="tutorial-card">
          <Image
            src="/assets/create-account.png"
            alt="create-account"
            width={72}
            height={72}
            className="tutorial-card-img"
          />
          <p className="tutorial-card-text">
            Create an account and select an available donation method.
          </p>
        </div>

        <div className="tutorial-card">
          <Image
            src="/assets/submit-form.png"
            alt="submit-form"
            width={56}
            height={56}
            className="tutorial-card-img"
          />
          <p className="tutorial-card-text">
            Submit the items you wish to donate by completing the form.
          </p>
        </div>

        <div className="tutorial-card">
          <Image
            src="/assets/wait-verification.png"
            alt="wait-verification"
            width={56}
            height={56}
            className="tutorial-card-img"
          />
          <p className="tutorial-card-text">
            Wait for the social organization to review and verify the items.
          </p>
        </div>

        <div className="tutorial-card">
          <Image
            src="/assets/pickup-item.png"
            alt="pickup-item"
            width={56}
            height={56}
            className="tutorial-card-img"
          />
          <p className="tutorial-card-text">
            The item is shipped according to the selected method.
          </p>
        </div>

        <div className="tutorial-card">
            <Image
            src="/assets/documentation-proof.png"
            alt="documentation-proof"
            width={56}
            height={56}
            className="tutorial-card-img"
          />
          <p className="tutorial-card-text">
            The social organization will upload receipt documentation as a proof.
          </p>
        </div>
      </div>
    </section>
    </>
  );
};

export default Home;