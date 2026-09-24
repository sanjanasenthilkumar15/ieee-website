/**
 * Content API used by every page.
 *
 * - With a Sanity project configured, data comes from Sanity via GROQ.
 * - Without one (fresh clone, demo), it falls back to src/content/*.json.
 *
 * Pages set their own `revalidate` for ISR; fetches are tagged by type so a
 * Sanity webhook (/api/revalidate) can refresh pages as soon as an editor
 * publishes.
 */
import { cache } from "react";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/client";
import * as local from "./local";
import * as q from "./queries";
import type {
  Achievement,
  Album,
  EventItem,
  ExecomMember,
  Post,
  Publication,
  SiteSettings,
  Society,
} from "./types";

export * from "./types";

/** True when showing offline JSON content instead of Sanity. */
export const usingLocalContent = !isSanityConfigured;

async function get<T>(query: string, tags: string[], fallback: T, params: Record<string, unknown> = {}) {
  if (usingLocalContent) return fallback;
  return sanityFetch<T>({ query, params, tags, fallback: emptyLike(fallback) });
}

/** On Sanity errors return an empty value of the same kind, never local data. */
function emptyLike<T>(v: T): T {
  return (Array.isArray(v) ? [] : null) as T;
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const s = await get<SiteSettings | null>(q.siteSettingsQuery, ["siteSettings"], local.localSettings);
  // Sanity may not have the singleton yet: fill gaps from local defaults.
  return { ...local.localSettings, ...(s ?? {}) } as SiteSettings;
});

export const getSocieties = cache(() => get<Society[]>(q.societiesQuery, ["society"], local.localSocieties));

export const getExecom = cache(() => get<ExecomMember[]>(q.execomQuery, ["execomMember"], local.localExecom));

export const getEvents = cache(() => get<EventItem[]>(q.eventsQuery, ["event"], local.localEvents));

export const getEventBySlug = cache(async (slug: string) => {
  if (usingLocalContent) return local.localEvents.find((e) => e.slug === slug) ?? null;
  return get<EventItem | null>(q.eventBySlugQuery, ["event"], null, { slug });
});

export const getAchievements = cache(() =>
  get<Achievement[]>(q.achievementsQuery, ["achievement"], local.localAchievements),
);

export const getPublications = cache(() =>
  get<Publication[]>(q.publicationsQuery, ["publication"], local.localPublications),
);

export const getPosts = cache(() => get<Post[]>(q.postsQuery, ["post"], local.localPosts));

export const getPostBySlug = cache(async (slug: string) => {
  if (usingLocalContent) return local.localPosts.find((p) => p.slug === slug) ?? null;
  return get<Post | null>(q.postBySlugQuery, ["post"], null, { slug });
});

export const getAlbums = cache(() => get<Album[]>(q.albumsQuery, ["galleryAlbum", "event"], local.localAlbums));

// ---------- helpers ----------

/** When an event is over: end date, or end of its start day for date-only events. */
export function eventEnds(e: Pick<EventItem, "startDate" | "endDate" | "hideTime">): Date {
  if (e.endDate) return new Date(e.endDate);
  const start = new Date(e.startDate);
  return e.hideTime ? new Date(start.getTime() + 24 * 3600 * 1000) : new Date(start.getTime() + 2 * 3600 * 1000);
}

export function splitEvents(events: EventItem[], now = new Date()) {
  const upcoming = events
    .filter((e) => eventEnds(e) >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = events.filter((e) => eventEnds(e) < now).sort((a, b) => b.startDate.localeCompare(a.startDate));
  return { upcoming, past };
}

export function execomYears(members: ExecomMember[]): number[] {
  return [...new Set(members.map((m) => m.year))].sort((a, b) => b - a);
}
