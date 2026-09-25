/**
 * Content API used by every public page. Reads from the site's own SQLite
 * database (src/server/db.ts) and resolves links between documents.
 * Pages render on each request, so edits made in /admin appear immediately.
 */
import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { getDoc, listDocs } from "@/server/db";
import type {
  StoredAchievement,
  StoredAlbum,
  StoredEvent,
  StoredExecomMember,
  StoredPost,
  StoredPublication,
  StoredSettings,
  StoredSociety,
} from "./stored";
import type { Achievement, Album, EventItem, ExecomMember, Post, Publication, SiteSettings, Society } from "./types";

export * from "./types";

const DEFAULT_SETTINGS: SiteSettings = {
  branchName: "IEEE Student Branch, R.M.K. Engineering College",
  branchCode: "STB61871",
  establishedYear: 2009,
  objectives: [],
  stats: {},
  milestones: [],
  recognitions: [],
  social: {},
  mediaCoverage: [],
};

/** Marks the page as rendered per request (content can change at any time in /admin). */
async function live() {
  await connection();
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  await live();
  const s = getDoc<StoredSettings>("siteSettings");
  return { ...DEFAULT_SETTINGS, ...(s ?? {}), stats: { ...(s?.stats ?? {}) }, social: { ...(s?.social ?? {}) } };
});

export const getSocieties = cache(async (): Promise<Society[]> => {
  await live();
  return listDocs<StoredSociety>("society").sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name),
  );
});

export const getExecom = cache(async (): Promise<ExecomMember[]> => {
  await live();
  return listDocs<StoredExecomMember>("execomMember").sort(
    (a, b) => b.year - a.year || (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name),
  );
});

const societyLookup = cache(async () => new Map((await getSocieties()).map((s) => [s.id, s])));

function toEvent(e: StoredEvent, societies: Map<string, Society>): EventItem {
  const { societyIds, ...rest } = e;
  return {
    ...rest,
    speakers: e.speakers ?? [],
    agenda: e.agenda ?? [],
    societies: (societyIds ?? [])
      .map((id) => societies.get(id))
      .filter((s): s is Society => Boolean(s))
      .map(({ id, name, shortName }) => ({ id, name, shortName })),
  };
}

export const getEvents = cache(async (): Promise<EventItem[]> => {
  await live();
  const societies = await societyLookup();
  return listDocs<StoredEvent>("event")
    .map((e) => toEvent(e, societies))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
});

export const getEventBySlug = cache(async (slug: string) => (await getEvents()).find((e) => e.slug === slug) ?? null);

const eventRef = cache(async () => {
  const map = new Map<string, { slug: string; title: string }>();
  for (const e of listDocs<StoredEvent>("event")) map.set(e.id, { slug: e.slug, title: e.title });
  return map;
});

export const getAchievements = cache(async (): Promise<Achievement[]> => {
  await live();
  return listDocs<StoredAchievement>("achievement")
    .map(({ proof, showProof, ...a }) => ({ ...a, featured: Boolean(a.featured), proofUrl: showProof ? proof?.url : undefined }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

export const getPublications = cache(async (): Promise<Publication[]> => {
  await live();
  return listDocs<StoredPublication>("publication").sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
});

export const getPosts = cache(async (): Promise<Post[]> => {
  await live();
  const events = await eventRef();
  return listDocs<StoredPost>("post")
    .map(({ relatedEventId, attachment, ...p }) => ({
      ...p,
      relatedEvent: relatedEventId ? events.get(relatedEventId) : undefined,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

export const getPostBySlug = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);

export const getAlbums = cache(async (): Promise<Album[]> => {
  await live();
  const events = await eventRef();
  return listDocs<StoredAlbum>("galleryAlbum")
    .map(({ eventId, ...a }) => ({
      ...a,
      photos: a.photos ?? [],
      videos: a.videos ?? [],
      event: eventId ? events.get(eventId) : undefined,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

// ---------- helpers ----------

/** When an event is over: end date, or end of its start day for date-only events. */
export function eventEnds(e: Pick<EventItem, "startDate" | "endDate" | "hideTime">): Date {
  if (e.endDate) return new Date(e.endDate);
  const start = new Date(e.startDate);
  return e.hideTime ? new Date(start.getTime() + 24 * 3600 * 1000) : new Date(start.getTime() + 2 * 3600 * 1000);
}

export function splitEvents(events: EventItem[], now = new Date()) {
  const upcoming = events.filter((e) => eventEnds(e) >= now).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = events.filter((e) => eventEnds(e) < now).sort((a, b) => b.startDate.localeCompare(a.startDate));
  return { upcoming, past };
}

export function execomYears(members: ExecomMember[]): number[] {
  return [...new Set(members.map((m) => m.year))].sort((a, b) => b - a);
}
