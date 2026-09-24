#!/usr/bin/env node
/**
 * Seed the Sanity dataset with the branch's real 2026 content (and,
 * optionally, clearly-marked sample entries).
 *
 *   node --env-file=.env.local scripts/seed/seed.mjs               # real content
 *   node --env-file=.env.local scripts/seed/seed.mjs --with-samples # + samples
 *   node scripts/seed/seed.mjs --dry-run                            # check only, no network
 *
 * Safe to re-run: documents use fixed IDs and are created-or-replaced.
 * NOTE: re-running overwrites Studio edits to seeded documents, so run it
 * once at setup and edit in the Studio afterwards.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@sanity/client";
import * as data from "./data.mjs";
import * as samples from "./samples.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(here, "assets");
const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const WITH_SAMPLES = args.has("--with-samples");

const societies = JSON.parse(readFileSync(join(here, "societies.json"), "utf8"));

// ---------- helpers ----------
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const ref = (id) => ({ _type: "reference", _ref: id, _key: key() });
const slug = (s) => ({ _type: "slug", current: s });

/** IST date + optional HH:MM → UTC ISO string. */
function istToIso(date, time) {
  return new Date(`${date}T${time ?? "00:00"}:00+05:30`).toISOString();
}

/** Plain strings → Portable Text paragraphs. */
function pt(paragraphs) {
  const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  return list.map((text) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  }));
}

// ---------- client ----------
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!DRY && (!projectId || projectId === "placeholder" || !token)) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.\n" +
      "Fill in .env.local and run:  node --env-file=.env.local scripts/seed/seed.mjs",
  );
  process.exit(1);
}

const client = DRY
  ? null
  : createClient({ projectId, dataset, token, apiVersion: "2026-09-01", useCdn: false });

const uploaded = new Map();
/** Upload a file from assets/ once; return an image/file field value. */
async function asset(relPath, { type = "image", alt } = {}) {
  const abs = join(ASSETS, relPath);
  if (!existsSync(abs)) throw new Error(`Missing asset: ${relPath}`);
  let id = uploaded.get(relPath);
  if (!id) {
    if (DRY) id = `dry-${basename(relPath)}`;
    else {
      const doc = await client.assets.upload(type, createReadStream(abs), { filename: basename(relPath) });
      id = doc._id;
    }
    uploaded.set(relPath, id);
    process.stdout.write(".");
  }
  return { _type: type, asset: { _type: "reference", _ref: id }, ...(alt ? { alt } : {}) };
}

// ---------- build documents ----------
async function build() {
  const docs = [];

  docs.push({ _id: "siteSettings", _type: "siteSettings", ...data.siteSettings,
    objectives: data.siteSettings.objectives,
    milestones: data.siteSettings.milestones.map((m) => ({ _key: key(), _type: "milestone", ...m })),
  });

  for (const s of societies) {
    docs.push({
      _id: `society-${s.id}`,
      _type: "society",
      name: s.name,
      shortName: s.shortName,
      kind: s.kind,
      website: s.website,
      order: s.order,
      description: s.description,
      logo: await asset(s.logo, { alt: `${s.name} logo` }),
    });
  }

  for (const m of data.execomMembers) {
    const { id, society, ...rest } = m;
    docs.push({
      _id: `execom-${m.year}-${id}`,
      _type: "execomMember",
      ...rest,
      ...(society ? { society: { _type: "reference", _ref: `society-${society}` } } : {}),
    });
  }

  for (const e of data.events) {
    docs.push({
      _id: `event-${e.id}`,
      _type: "event",
      title: e.title,
      slug: slug(e.id),
      eventType: e.eventType,
      ...(e.seriesLabel ? { seriesLabel: e.seriesLabel } : {}),
      startDate: istToIso(e.date, e.time),
      ...(e.endTime ? { endDate: istToIso(e.date, e.endTime) } : {}),
      hideTime: !e.time,
      mode: e.mode,
      venue: e.venue,
      summary: e.summary,
      featured: Boolean(e.featured),
      ...(e.societies ? { societies: e.societies.map((s) => ref(`society-${s}`)) } : {}),
      ...(e.speakers
        ? { speakers: e.speakers.map((s) => ({ _key: key(), _type: "speaker", ...s })) }
        : {}),
      ...(e.joinUrl ? { joinUrl: e.joinUrl } : {}),
      ...(e.poster ? { poster: await asset(e.poster, { alt: `Poster: ${e.seriesLabel ?? ""} ${e.title}`.trim() }) } : {}),
    });
  }

  for (const a of data.galleryAlbums) {
    const photos = [];
    for (const p of a.photos) photos.push({ _key: key(), ...(await asset(p.file, { alt: p.alt })) });
    docs.push({
      _id: `album-${a.id}`,
      _type: "galleryAlbum",
      title: a.title,
      slug: slug(a.id),
      date: a.date,
      ...(a.event ? { event: { _type: "reference", _ref: `event-${a.event}` } } : {}),
      photos,
    });
  }

  if (WITH_SAMPLES) {
    for (const a of samples.achievements) {
      const { id, ...rest } = a;
      docs.push({ _id: id, _type: "achievement", ...rest });
    }
    for (const p of samples.publications) {
      const { id, abstract, ...rest } = p;
      docs.push({ _id: id, _type: "publication", ...rest, abstract: pt(abstract) });
    }
    for (const p of samples.posts) {
      const { id, body, relatedEvent, ...rest } = p;
      docs.push({
        _id: id,
        _type: "post",
        ...rest,
        slug: slug(id.replace(/^sample-post-/, "sample-")),
        body: pt(body),
        ...(relatedEvent ? { relatedEvent: { _type: "reference", _ref: `event-${relatedEvent}` } } : {}),
      });
    }
  }
  return docs;
}

// ---------- run ----------
process.stdout.write(DRY ? "Dry run — checking assets " : "Uploading assets ");
const docs = await build();
console.log(" done");

const counts = docs.reduce((acc, d) => ((acc[d._type] = (acc[d._type] || 0) + 1), acc), {});
console.log("Documents:", counts, `| assets: ${uploaded.size}`);

if (DRY) {
  if (process.env.SEED_DUMP) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(process.env.SEED_DUMP, docs.map((d) => JSON.stringify(d)).join("\n"));
  }
  console.log("Dry run complete — nothing written.");
  process.exit(0);
}

// Societies first so references resolve, then everything else.
const order = ["siteSettings", "society", "execomMember", "event", "galleryAlbum", "achievement", "publication", "post"];
docs.sort((a, b) => order.indexOf(a._type) - order.indexOf(b._type));
for (let i = 0; i < docs.length; i += 50) {
  const tx = client.transaction();
  docs.slice(i, i + 50).forEach((d) => tx.createOrReplace(d));
  await tx.commit({ visibility: "async" });
}
console.log(`Seeded ${docs.length} documents into ${projectId}/${dataset}.`);
