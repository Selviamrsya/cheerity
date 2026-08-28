import Image from "next/image";
import Link from "next/link";

const DonationOverview = () => {
  return (
    <section className="hero-section">
      <Image
        src="/assets/landing-page.png"
        alt="Give a Box, Light a Future"
        fill
        priority
        className="hero-image"
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">
          Give a Box,
          <br />
          Light a Future
        </h1>
        <p className="hero-subtitle">
          A seamless donation experience designed to make giving feel simple,
          secure, and meaningful.
        </p>
        <Link href="/donate" className="hero-cta">
          Start Donating
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8H13M13 8L9 4M13 8L9 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default DonationOverview;