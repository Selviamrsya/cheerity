import React from "react";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { db } from "@/app/database/drizzle";
import { users } from "@/app/database/schema";
import { eq } from "drizzle-orm";
import { getDonationsWithDistance } from "@/lib/actions/donation";
import DonationCard from "@/components/DonationCard";
import Link from "next/link";
import { headers } from "next/headers";
import { HomeHero } from "@/components/landing/HomeHero";
import { InfoCard, TutorialStep } from "@/components/landing/InfoCard";
import { donationGridClass } from "@/lib/ui";
import { appButtonVariants } from "@/components/ui/app-button";
import { cn } from "@/lib/utils";

const tutorialSteps = [
  {
    src: "/assets/create-account.png",
    alt: "create-account",
    text: "Create an account and select an available donation method.",
  },
  {
    src: "/assets/submit-form.png",
    alt: "submit-form",
    text: "Submit the items you wish to donate by completing the form.",
  },
  {
    src: "/assets/wait-verification.png",
    alt: "wait-verification",
    text: "Wait for the social organization to review and verify the items.",
  },
  {
    src: "/assets/pickup-item.png",
    alt: "pickup-item",
    text: "The item is shipped according to the selected method.",
  },
  {
    src: "/assets/documentation-proof.png",
    alt: "documentation-proof",
    text: "The social organization will upload receipt documentation as a proof.",
  },
];

const Home = async () => {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);

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
    limit: 3,
  });

  return (
    <>
      <HomeHero />

      <section className="mx-auto w-full max-w-345 px-8 py-12 md:px-32 md:py-36">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="font-poppins text-2xl font-bold text-text-main md:text-3xl">
            One platform, Two ways to make an impact
          </h2>
          <p className="mt-2 font-inter text-sm leading-relaxed text-text-muted md:text-base">
            A simple way to connect generosity with real needs. Whether you&apos;re looking to donate usable items or represent an organization seeking support.
          </p>
        </div>

        <div className="grid gap-2 grid-cols-2">
          <InfoCard
            src="/assets/donate.png"
            alt="Donate"
            title="Donate"
            text="Give unused but valuable items a new purpose by donating them to people who can benefit from them"
          />
          <InfoCard
            src="/assets/distribute.png"
            alt="Distribute"
            title="Distribute"
            text="Help registered institutions and social communities receive and distribute essential supplies directly to people in need."
          />
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="mx-auto w-full max-w-345 px-8 py-12 md:px-32 md:py-24">
          <h2 className="mb-8 text-center font-poppins text-2xl font-bold md:text-3xl">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {tutorialSteps.map((step, index) => (
              <TutorialStep
                key={step.alt}
                {...step}
                delay={cn("animate-fade-in", ["delay-100", "delay-200", "delay-300", "delay-400", "delay-500"][index])}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-345 px-8 py-12 md:px-32 md:py-24">
        <h2 className="mb-8 text-center font-poppins text-2xl font-bold text-text-main md:text-3xl">
          Discover Donations Inspired by What You Care About
        </h2>

        {donations.length === 0 ? (
          <p className="text-center text-on-surface-variant">
            No active donation campaigns yet. Check back soon!
          </p>
        ) : (
          <div className={cn(donationGridClass, "xl:grid-cols-3")}>
            {donations.map((donation, index) => (
              <div
                key={donation.id}
                className={cn("animate-fade-in", ["delay-100", "delay-200", "delay-300"][index % 3])}
              >
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

        <div className="mt-8 text-center">
          <Link
            href="/donate"
            className={cn(appButtonVariants({ variant: "outline", width: "auto" }), "mx-4")}
          >
            See All Donations
          </Link>
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="mx-auto w-full max-w-3xl px-8 py-12 text-center md:px-12 md:py-16">
          <h2 className="font-poppins text-2xl font-bold text-text-main md:text-3xl">
            About Us
          </h2>
          <p className="mt-4 font-inter text-sm leading-relaxed text-on-surface md:text-base">
            Cheerity is an innovative donation platform designed to bridge the gap between compassionate donors and social organizations in need.
            We ensures that donations are precisely aligned with the actual requirements of social organizations.
          </p>
          <p className="mt-3 font-inter text-sm leading-relaxed text-on-surface md:text-base">
            Our mission is to bridge the gap between those who want to help and those who need it most.
            Through the good transparency and trust, we&apos;re building a world where everyone can contribute to positive change by creating a seamless ecosystem where every act of kindness finds its place.
          </p>
        </div>
      </section>
    </>
  );
};

export default Home;
