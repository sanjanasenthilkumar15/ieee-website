import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity's image CDN (used from Phase 2 onward).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
