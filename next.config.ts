import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity's image CDN (used from Phase 2 onward).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      // YouTube thumbnails for video embeds
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
