/**
 * Offline content, used automatically while no Sanity project is configured
 * (NEXT_PUBLIC_SANITY_PROJECT_ID unset). It reads the same JSON the seed
 * script loads into Sanity, so the demo site shows the branch's real 2026
 * content. Achievements, publications and posts come from samples.json and
 * are clearly labelled as samples.
 */
import albumsJson from "@/content/albums.json";
import eventsJson from "@/content/events.json";
import execomJson from "@/content/execom.json";
import manifest from "@/content/image-manifest.json";
import samplesJson from "@/content/samples.json";
import settingsJson from "@/content/siteSettings.json";
import societiesJson from "@/content/societies.json";
import type {
  Achievement,
  Album,
  EventItem,
  ExecomMember,
  Post,
  Publication,
  RichText,
  SiteSettings,
  Society,
} from "./types";

const sizes = manifest as unknown as Record<string, [number, number]>;

function img(path: string | undefined, alt: string) {
  if (!path) return undefined;
  const [width, height] = sizes[path] ?? [1200, 800];
  return { url: `/content/${path}`, alt, width, height };
}

function pt(paragraphs: string | string[]): RichText {
  return (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).map((text, i) => ({
    _type: "block",
    _key: `p${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
  }));
}

const istToIso = (date: string, time?: string | null) =>
  new Date(`${date}T${time ?? "00:00"}:00+05:30`).toISOString();

export const localSettings: SiteSettings = {
  recognitions: [],
  social: {},
  mediaCoverage: [],
  ...settingsJson,
  stats: { ...settingsJson.stats },
};

export const localSocieties: Society[] = societiesJson.map((s) => ({
  id: `society-${s.id}`,
  name: s.name,
  shortName: s.shortName,
  kind: s.kind as Society["kind"],
  description: s.description,
  website: s.website,
  logo: img(s.logo, `${s.name} logo`),
}));

const societyById = new Map(localSocieties.map((s) => [s.id, s]));

export const localExecom: ExecomMember[] = execomJson.map((m) => ({
  ...m,
  id: `execom-${m.year}-${m.id}`,
  memberType: m.memberType as ExecomMember["memberType"],
  section: (m as { section?: string }).section as ExecomMember["section"],
  photo: img((m as { photo?: string }).photo, `${m.name}, ${m.role}`),
}));

type RawEvent = (typeof eventsJson)[number] & {
  seriesLabel?: string;
  endTime?: string;
  societies?: string[];
  speakers?: { name: string; designation?: string; affiliation?: string; role?: string }[];
  poster?: string;
  joinUrl?: string;
  featured?: boolean;
};

export const localEvents: EventItem[] = (eventsJson as RawEvent[])
  .map((e) => ({
    id: `event-${e.id}`,
    slug: e.id,
    title: e.title,
    seriesLabel: e.seriesLabel,
    eventType: e.eventType,
    startDate: istToIso(e.date, e.time),
    endDate: e.endTime ? istToIso(e.date, e.endTime) : undefined,
    hideTime: !e.time,
    mode: e.mode as EventItem["mode"],
    venue: e.venue,
    summary: e.summary,
    featured: Boolean(e.featured),
    societies: (e.societies ?? [])
      .map((id) => societyById.get(`society-${id}`))
      .filter((s): s is Society => Boolean(s))
      .map(({ id, name, shortName }) => ({ id, name, shortName })),
    poster: img(e.poster, `Poster: ${[e.seriesLabel, e.title].filter(Boolean).join(" — ")}`),
    speakers: e.speakers ?? [],
    joinUrl: e.joinUrl,
    agenda: [],
  }))
  .sort((a, b) => b.startDate.localeCompare(a.startDate));

const eventTitle = new Map(localEvents.map((e) => [e.slug, e.title]));

export const localAlbums: Album[] = albumsJson
  .map((a) => {
    const ev = (a as { event?: string }).event;
    return {
      id: `album-${a.id}`,
      slug: a.id,
      title: a.title,
      date: a.date,
      event: ev ? { slug: ev, title: eventTitle.get(ev) ?? ev } : undefined,
      photos: a.photos.map((p) => ({ ...img(p.file, p.alt)! })),
      videos: [],
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export const localAchievements: Achievement[] = samplesJson.achievements.map((a) => ({
  ...a,
  featured: Boolean(a.featured),
}));

export const localPublications: Publication[] = samplesJson.publications.map((p) => ({
  ...p,
  abstract: pt(p.abstract),
}));

export const localPosts: Post[] = samplesJson.posts.map((p) => ({
  id: p.id,
  slug: p.id.replace(/^sample-post-/, "sample-"),
  title: p.title,
  type: p.type,
  author: p.author,
  date: p.date,
  excerpt: p.excerpt,
  body: pt(p.body),
  relatedEvent: p.relatedEvent
    ? { slug: p.relatedEvent, title: eventTitle.get(p.relatedEvent) ?? p.relatedEvent }
    : undefined,
}));
