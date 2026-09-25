/**
 * Starter content loaded into the database the very first time the site
 * starts (see db.ts). Built from src/content/*.json — the branch's real 2026
 * events, Execom, societies and photos — plus a few clearly-labelled sample
 * achievements, publications and posts that can be deleted in the admin.
 */
import albumsJson from "@/content/albums.json";
import eventsJson from "@/content/events.json";
import execomJson from "@/content/execom.json";
import manifest from "@/content/image-manifest.json";
import samplesJson from "@/content/samples.json";
import settingsJson from "@/content/siteSettings.json";
import societiesJson from "@/content/societies.json";
import type { StoredDocs } from "@/lib/content/stored";

const sizes = manifest as unknown as Record<string, [number, number]>;

function img(path: string | undefined, alt: string) {
  if (!path) return undefined;
  const [width, height] = sizes[path] ?? [1200, 800];
  return { url: `/content/${path}`, alt, width, height };
}

const istToIso = (date: string, time?: string | null) => new Date(`${date}T${time ?? "00:00"}:00+05:30`).toISOString();
const md = (p: string | string[]) => (Array.isArray(p) ? p.join("\n\n") : p);

type SeedDoc = { [K in keyof StoredDocs]: { id: string; type: K; data: StoredDocs[K] } }[keyof StoredDocs];

export function buildSeedDocuments(): SeedDoc[] {
  const docs: SeedDoc[] = [];

  docs.push({
    id: "siteSettings",
    type: "siteSettings",
    data: {
      recognitions: [],
      social: {},
      mediaCoverage: [],
      ...settingsJson,
      stats: { ...settingsJson.stats },
    },
  });

  for (const s of societiesJson) {
    docs.push({
      id: `society-${s.id}`,
      type: "society",
      data: {
        id: `society-${s.id}`,
        name: s.name,
        shortName: s.shortName,
        kind: s.kind as "society" | "council" | "affinity",
        description: s.description,
        website: s.website,
        order: s.order,
        logo: img(s.logo, `${s.name} logo`),
      },
    });
  }

  for (const m of execomJson as (typeof execomJson[number] & { section?: string; photo?: string })[]) {
    const id = `execom-${m.year}-${m.id}`;
    docs.push({
      id,
      type: "execomMember",
      data: {
        id,
        name: m.name,
        year: m.year,
        role: m.role,
        memberType: m.memberType as "student" | "faculty",
        section: m.section as "core" | "chairs" | undefined,
        order: m.order,
        department: (m as { department?: string }).department,
        yearOfStudy: (m as { yearOfStudy?: string }).yearOfStudy,
        photo: img(m.photo, `${m.name}, ${m.role}`),
      },
    });
  }

  type RawEvent = (typeof eventsJson)[number] & {
    seriesLabel?: string;
    endTime?: string;
    societies?: string[];
    speakers?: { name: string; designation?: string; affiliation?: string; role?: string }[];
    poster?: string;
    joinUrl?: string;
    featured?: boolean;
  };
  for (const e of eventsJson as RawEvent[]) {
    const id = `event-${e.id}`;
    docs.push({
      id,
      type: "event",
      data: {
        id,
        slug: e.id,
        title: e.title,
        seriesLabel: e.seriesLabel,
        eventType: e.eventType,
        startDate: istToIso(e.date, e.time),
        endDate: e.endTime ? istToIso(e.date, e.endTime) : undefined,
        hideTime: !e.time,
        mode: e.mode as "in-person" | "online" | "hybrid",
        venue: e.venue,
        summary: e.summary,
        featured: Boolean(e.featured),
        societyIds: (e.societies ?? []).map((s) => `society-${s}`),
        poster: img(e.poster, `Poster: ${[e.seriesLabel, e.title].filter(Boolean).join(" — ")}`),
        speakers: e.speakers ?? [],
        joinUrl: e.joinUrl,
        agenda: [],
      },
    });
  }

  for (const a of albumsJson as (typeof albumsJson[number] & { event?: string })[]) {
    const id = `album-${a.id}`;
    docs.push({
      id,
      type: "galleryAlbum",
      data: {
        id,
        slug: a.id,
        title: a.title,
        date: a.date,
        eventId: a.event ? `event-${a.event}` : undefined,
        photos: a.photos.map((p) => img(p.file, p.alt)!),
        videos: [],
      },
    });
  }

  for (const a of samplesJson.achievements) {
    docs.push({ id: a.id, type: "achievement", data: { ...a, featured: Boolean(a.featured) } });
  }
  for (const p of samplesJson.publications) {
    docs.push({ id: p.id, type: "publication", data: { ...p, abstract: md(p.abstract) } });
  }
  for (const p of samplesJson.posts) {
    docs.push({
      id: p.id,
      type: "post",
      data: {
        id: p.id,
        slug: p.id.replace(/^sample-post-/, "sample-"),
        title: p.title,
        type: p.type,
        author: p.author,
        date: p.date,
        excerpt: p.excerpt,
        body: md(p.body),
        relatedEventId: p.relatedEvent ? `event-${p.relatedEvent}` : undefined,
      },
    });
  }
  return docs;
}
