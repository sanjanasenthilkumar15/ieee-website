import type { MetadataRoute } from "next";
import { execomYears, getEvents, getExecom, getPosts } from "@/lib/content";
import { siteUrl } from "@/lib/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts, execom] = await Promise.all([getEvents(), getPosts(), getExecom()]);
  const staticPages = ["", "/about", "/execom", "/events", "/achievements", "/publications", "/blog", "/gallery", "/join", "/contact"];
  return [
    ...staticPages.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...events.map((e) => ({ url: `${siteUrl}/events/${e.slug}`, lastModified: e.startDate, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: p.date, priority: 0.5 })),
    ...execomYears(execom).slice(1).map((y) => ({ url: `${siteUrl}/execom/${y}`, priority: 0.3 })),
  ];
}
