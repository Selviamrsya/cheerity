import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js Image component to optimize local uploaded images
    remotePatterns: [],
    // Local /public/uploads/* are served as static files, no config needed
  },
};

export default nextConfig;
