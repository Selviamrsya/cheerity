import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative -mt-18 flex min-h-[520px] items-center overflow-hidden md:min-h-[640px] lg:min-h-screen">
      <Image
        src="/assets/landing-page.png"
        alt="Give a Box, Light a Future"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-primary-900/80 via-primary-800/55 to-black/20" />
      <div className="relative z-10 mx-auto w-full max-w-345 px-8 pt-28 pb-16 md:px-32 md:pt-32 md:pb-24">
        <h1 className="max-w-xl font-poppins text-4xl leading-tight font-semibold text-white sm:text-5xl lg:text-6xl">
          Give a Box,
          <br />
          Light a Future
        </h1>
        <p className="mt-4 max-w-lg font-inter text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
          Connect your unused belongings with people who truly need them. Every
          donation makes a difference.
        </p>
        <Link
          href="/donate"
          className="mt-8 inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary-900 no-underline transition-all hover:bg-primary-50"
        >
          Start Donating
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
