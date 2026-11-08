import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js Image component to optimize uploaded images hosted on ImageKit
    remotePatterns: [
      { protocol: "https", hostname: "**.imagekit.io" },
    ],
    // App assets in /public (logo, landing images) are served as static files, no config needed
  },
};

export default nextConfig;
