import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

/** Read-only client for public content (uses Sanity's CDN). */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

/**
 * Fetch helper for pages. Returns `fallback` instead of throwing when Sanity
 * isn't configured yet, so the site renders with empty states pre-setup.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 3600,
  tags = [],
  fallback,
}: {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
  fallback: T;
}): Promise<T> {
  if (!isSanityConfigured) return fallback;
  try {
    return await client.fetch<T>(query, params, { next: { revalidate, tags } });
  } catch (err) {
    console.error("[sanity] fetch failed:", err);
    return fallback;
  }
}
