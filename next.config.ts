import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build for the college server: `npm run build` produces
  // .next/standalone with its own minimal node_modules (see DEPLOY.md).
  output: "standalone",
  images: {
    remotePatterns: [
      // YouTube thumbnails for video embeds
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  experimental: {
    // Admin uploads (several photos at once) go through server actions.
    serverActions: { bodySizeLimit: "60mb" },
  },
  // node:sqlite is built into Node; keep sharp as a runtime dependency.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
