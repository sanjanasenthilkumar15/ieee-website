import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteUrl } from "@/lib/siteUrl";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection(); // read SITE_URL / SITE_NOINDEX at run time, not build time
  // Set SITE_NOINDEX=true on review/staging servers to keep them out of search engines.
  if (process.env.SITE_NOINDEX === "true") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
