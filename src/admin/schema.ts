/**
 * Admin panel content definitions. Each content type lists its fields once;
 * the admin list pages, edit forms and server-side validation are all driven
 * from here. To add a field, add it below — no other admin code changes.
 *
 * Plain data only (no server imports) so client form components can use it.
 */
import {
  achievementCategories,
  departments,
  eventTypes,
  postTypes,
  researchAreas,
  yearsOfStudy,
} from "@/lib/options";

type Opt = { title: string; value: string };

type Base = {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  /** Half-width on large screens. */
  half?: boolean;
  /** Only show when another field has a given value. */
  showIf?: { field: string; equals?: unknown; notEquals?: unknown };
};

export type Field =
  | (Base & { kind: "text" | "email" | "url" | "slug"; placeholder?: string; max?: number; slugFrom?: string })
  | (Base & { kind: "textarea"; rows?: number; max?: number; placeholder?: string })
  | (Base & { kind: "markdown"; rows?: number })
  | (Base & { kind: "number"; min?: number; max?: number })
  | (Base & { kind: "date" })
  | (Base & { kind: "datetime" })
  | (Base & { kind: "checkbox" })
  | (Base & { kind: "select"; options: Opt[]; radio?: boolean })
  | (Base & { kind: "image" })
  | (Base & { kind: "images" })
  | (Base & { kind: "file"; accept?: string })
  | (Base & { kind: "strings"; itemLabel?: string })
  | (Base & { kind: "ref"; refType: string })
  | (Base & { kind: "refs"; refType: string })
  | (Base & { kind: "list"; itemLabel: string; fields: Field[] })
  | (Base & { kind: "group"; fields: Field[] });

export type Section = { title: string; fields: Field[] };

export type ContentType = {
  type: string;
  label: string;
  singular: string;
  description: string;
  /** Singleton types are edited directly (no list). */
  singletonId?: string;
  sections: Section[];
  /** Default values for a new document. */
  defaults?: () => Record<string, unknown>;
  /** How each document appears in the admin list. */
  row: (d: Record<string, unknown>) => { title: string; subtitle?: string; image?: string; group?: string; badge?: string };
  /** Sort for the admin list. */
  sort?: (a: Record<string, unknown>, b: Record<string, unknown>) => number;
  /** Public URL of a document, for "View on site". */
  publicUrl?: (d: Record<string, unknown>) => string;
  /** Unique field(s) checked on save. */
  unique?: string[];
};

const s = (v: unknown) => (typeof v === "string" ? v : "");
const n = (v: unknown) => (typeof v === "number" ? v : 0);
const imgUrl = (v: unknown) => (v && typeof v === "object" && "url" in v ? String((v as { url: string }).url) : undefined);
const fmtDate = (iso: string) =>
  iso
    ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00+05:30` : iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "";

const linkFields: Field[] = [];

export const contentTypes: ContentType[] = [
  // ---------------------------------------------------------------- events
  {
    type: "event",
    label: "Events",
    singular: "Event",
    description: "Webinars, workshops, meetings and drives. Upcoming vs past is worked out from the date.",
    unique: ["slug"],
    defaults: () => ({ eventType: "webinar", mode: "in-person", hideTime: false, featured: false, speakers: [], agenda: [], societyIds: [] }),
    row: (d) => ({
      title: s(d.title),
      subtitle: [s(d.seriesLabel), fmtDate(s(d.startDate)), s(d.venue)].filter(Boolean).join(" · "),
      image: imgUrl(d.poster),
      group: new Date(s(d.startDate)) >= new Date(Date.now() - 24 * 3600 * 1000) ? "Upcoming" : "Past",
      badge: eventTypes.find((t) => t.value === d.eventType)?.title.split(" /")[0],
    }),
    sort: (a, b) => s(b.startDate).localeCompare(s(a.startDate)),
    publicUrl: (d) => `/events/${s(d.slug)}`,
    sections: [
      {
        title: "Basics",
        fields: [
          { name: "title", label: "Event title", kind: "text", required: true },
          { name: "slug", label: "Web address", kind: "slug", slugFrom: "title", required: true, help: "Used in the page link: /events/<this>." },
          { name: "eventType", label: "Event type", kind: "select", options: eventTypes, required: true, half: true, help: "Sets the coloured stripe on the event card." },
          { name: "seriesLabel", label: "Series label", kind: "text", half: true, placeholder: "e.g. Weekly Webinar #9" },
          { name: "startDate", label: "Starts (IST)", kind: "datetime", required: true, half: true },
          { name: "endDate", label: "Ends (IST, optional)", kind: "datetime", half: true },
          { name: "hideTime", label: "Date only — hide the time", kind: "checkbox", help: "Tick if the time isn’t known or doesn’t matter." },
          { name: "mode", label: "Mode", kind: "select", radio: true, options: [
            { title: "In person", value: "in-person" },
            { title: "Online", value: "online" },
            { title: "Hybrid", value: "hybrid" },
          ] },
          { name: "venue", label: "Venue / platform", kind: "text", placeholder: "e.g. Seminar Hall, Main Block — or Zoom / YouTube Live" },
          { name: "societyIds", label: "Co-hosting societies / councils", kind: "refs", refType: "society" },
          { name: "summary", label: "Short summary", kind: "textarea", rows: 2, max: 280, help: "One or two sentences for event cards." },
          { name: "description", label: "Description", kind: "markdown" },
          { name: "objective", label: "Objective", kind: "textarea", rows: 3 },
          { name: "featured", label: "Feature on the home page", kind: "checkbox", help: "If several upcoming events are featured, the soonest one is shown." },
        ],
      },
      {
        title: "Speakers & agenda",
        fields: [
          {
            name: "speakers",
            label: "Speakers / chief guests",
            kind: "list",
            itemLabel: "speaker",
            fields: [
              { name: "name", label: "Name", kind: "text", required: true, half: true },
              { name: "role", label: "Role", kind: "select", half: true, options: ["Speaker", "Chief Guest", "Guest of Honour", "Resource Person", "Judge", "Moderator"].map((v) => ({ title: v, value: v })) },
              { name: "designation", label: "Designation", kind: "text" },
              { name: "affiliation", label: "Organisation", kind: "text" },
              { name: "photo", label: "Photo", kind: "image" },
            ],
          },
          {
            name: "agenda",
            label: "Agenda",
            kind: "list",
            itemLabel: "agenda item",
            fields: [
              { name: "time", label: "Time", kind: "text", half: true, placeholder: "6:30 PM" },
              { name: "title", label: "Item", kind: "text", half: true, required: true },
              { name: "detail", label: "Detail", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Poster & links",
        fields: [
          { name: "poster", label: "Poster", kind: "image" },
          { name: "registrationUrl", label: "Registration link", kind: "url", help: "Shown only while the event is upcoming." },
          { name: "joinUrl", label: "Live stream / meeting link", kind: "url" },
          { name: "recordingUrl", label: "Recording link (YouTube)", kind: "url" },
          { name: "socialPostUrl", label: "Social media post", kind: "url" },
        ],
      },
      {
        title: "Report (after the event)",
        fields: [
          { name: "report", label: "Event report", kind: "markdown" },
          { name: "reportFile", label: "Report file (PDF / Word)", kind: "file", accept: ".pdf,.doc,.docx" },
          { name: "attendance", label: "Attendance", kind: "number", min: 0, half: true },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- execom
  {
    type: "execomMember",
    label: "Execom",
    singular: "Execom member",
    description: "Office bearers and faculty for each year. Adding members for a new year makes “Past committees” appear on the site.",
    defaults: () => ({ year: new Date().getFullYear(), memberType: "student", section: "core" }),
    row: (d) => ({
      title: s(d.name),
      subtitle: [s(d.role), s(d.department)].filter(Boolean).join(" · "),
      image: imgUrl(d.photo),
      group: `${n(d.year)} committee`,
    }),
    sort: (a, b) => n(b.year) - n(a.year) || n(a.order ?? 999) - n(b.order ?? 999) || s(a.name).localeCompare(s(b.name)),
    publicUrl: () => "/execom",
    sections: [
      {
        title: "Member",
        fields: [
          { name: "name", label: "Full name", kind: "text", required: true },
          { name: "role", label: "Role / designation", kind: "text", required: true, placeholder: "e.g. Chair, Secretary, Chair – IEEE WIE" },
          { name: "year", label: "Execom year", kind: "number", required: true, min: 2009, max: 2100, half: true },
          { name: "order", label: "Display order", kind: "number", half: true, help: "Lower numbers appear first." },
          { name: "memberType", label: "Member type", kind: "select", radio: true, required: true, options: [
            { title: "Student office bearer", value: "student" },
            { title: "Faculty (Counselor / Coordinator)", value: "faculty" },
          ] },
          { name: "section", label: "Section on the Execom page", kind: "select", radio: true, showIf: { field: "memberType", equals: "student" }, options: [
            { title: "Office bearers", value: "core" },
            { title: "Chairs — affinity groups & initiatives", value: "chairs" },
          ] },
          { name: "photo", label: "Photo", kind: "image", help: "Head-and-shoulders photo, ideally square. Shown in a circle." },
          { name: "department", label: "Department", kind: "select", options: departments, half: true },
          { name: "yearOfStudy", label: "Year of study", kind: "select", options: yearsOfStudy, half: true, showIf: { field: "memberType", equals: "student" } },
          { name: "linkedin", label: "LinkedIn URL", kind: "url", half: true },
          { name: "ieeeProfile", label: "IEEE profile URL", kind: "url", half: true },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- societies
  {
    type: "society",
    label: "Societies",
    singular: "Society / council",
    description: "IEEE societies, councils and affinity groups the branch works with.",
    defaults: () => ({ kind: "society" }),
    row: (d) => ({ title: s(d.name), subtitle: s(d.shortName), image: imgUrl(d.logo), group: d.kind === "council" ? "Councils" : d.kind === "affinity" ? "Affinity groups" : "Societies" }),
    sort: (a, b) => n(a.order ?? 999) - n(b.order ?? 999) || s(a.name).localeCompare(s(b.name)),
    publicUrl: () => "/execom#soc-heading",
    sections: [
      {
        title: "Society",
        fields: [
          { name: "name", label: "Full name", kind: "text", required: true },
          { name: "shortName", label: "Short name", kind: "text", half: true, placeholder: "e.g. CS, AP-S, WIE" },
          { name: "order", label: "Display order", kind: "number", half: true },
          { name: "kind", label: "Type", kind: "select", radio: true, required: true, options: [
            { title: "Society", value: "society" },
            { title: "Council", value: "council" },
            { title: "Affinity group", value: "affinity" },
          ] },
          { name: "logo", label: "Logo", kind: "image" },
          { name: "description", label: "Short description", kind: "textarea", rows: 4, max: 700 },
          { name: "website", label: "Official website", kind: "url" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- achievements
  {
    type: "achievement",
    label: "Achievements",
    singular: "Achievement",
    description: "Member wins, awards, papers and reviewer roles. Shown by category, not department.",
    defaults: () => ({ category: "competition", featured: false, showProof: false, date: new Date().toISOString().slice(0, 10) }),
    row: (d) => ({ title: s(d.title), subtitle: [s(d.memberName), fmtDate(s(d.date))].filter(Boolean).join(" · "), image: imgUrl(d.photo), badge: achievementCategories.find((c) => c.value === d.category)?.title.split(" (")[0] }),
    sort: (a, b) => s(b.date).localeCompare(s(a.date)),
    publicUrl: () => "/achievements",
    sections: [
      {
        title: "Achievement",
        fields: [
          { name: "title", label: "Achievement", kind: "text", required: true, placeholder: "e.g. Winner — Smart India Hackathon 2026" },
          { name: "category", label: "Category", kind: "select", options: achievementCategories, required: true, half: true },
          { name: "date", label: "Date", kind: "date", required: true, half: true },
          { name: "memberName", label: "Member name(s)", kind: "text", required: true, help: "For teams, separate names with commas." },
          { name: "department", label: "Department", kind: "select", options: departments, half: true },
          { name: "yearOfStudy", label: "Year of study", kind: "select", options: yearsOfStudy, half: true },
          { name: "organizer", label: "Event / organiser", kind: "text", half: true },
          { name: "position", label: "Position / recognition", kind: "text", half: true, placeholder: "e.g. 1st Prize, Finalist" },
          { name: "projectTitle", label: "Project or paper title", kind: "text" },
          { name: "photo", label: "Photo", kind: "image" },
          { name: "proof", label: "Certificate / proof", kind: "file", accept: ".pdf,.jpg,.jpeg,.png" },
          { name: "showProof", label: "Show certificate link publicly", kind: "checkbox" },
          { name: "featured", label: "Highlight on home page", kind: "checkbox" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- publications
  {
    type: "publication",
    label: "Publications",
    singular: "Publication",
    description: "Papers by members in conferences and journals.",
    defaults: () => ({ venueType: "conference", year: new Date().getFullYear(), authors: [] }),
    row: (d) => ({ title: s(d.title), subtitle: [s(d.venue), String(d.year ?? "")].filter(Boolean).join(" · ") }),
    sort: (a, b) => n(b.year) - n(a.year),
    publicUrl: () => "/publications",
    sections: [
      {
        title: "Publication",
        fields: [
          { name: "title", label: "Paper title", kind: "text", required: true },
          { name: "authors", label: "Authors", kind: "strings", itemLabel: "author", required: true, help: "In the order printed on the paper." },
          { name: "venueType", label: "Published in", kind: "select", radio: true, options: [
            { title: "Conference", value: "conference" },
            { title: "Journal", value: "journal" },
            { title: "Book chapter", value: "chapter" },
            { title: "Preprint", value: "preprint" },
          ] },
          { name: "venue", label: "Conference / journal name", kind: "text", required: true },
          { name: "year", label: "Year", kind: "number", required: true, min: 1990, max: 2100, half: true },
          { name: "researchArea", label: "Research area", kind: "select", options: researchAreas, half: true },
          { name: "doi", label: "DOI", kind: "text", half: true, placeholder: "10.1109/…" },
          { name: "link", label: "IEEE Xplore / official link", kind: "url", half: true },
          { name: "abstract", label: "Abstract", kind: "markdown", rows: 6 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ posts
  {
    type: "post",
    label: "Blog & Newsletter",
    singular: "Post",
    description: "Articles, event reports, student stories, newsletters and resources.",
    unique: ["slug"],
    defaults: () => ({ type: "article", date: new Date().toISOString().slice(0, 10) }),
    row: (d) => ({ title: s(d.title), subtitle: [s(d.author), fmtDate(s(d.date))].filter(Boolean).join(" · "), image: imgUrl(d.coverImage), badge: postTypes.find((t) => t.value === d.type)?.title.split(" (")[0] }),
    sort: (a, b) => s(b.date).localeCompare(s(a.date)),
    publicUrl: (d) => `/blog/${s(d.slug)}`,
    sections: [
      {
        title: "Post",
        fields: [
          { name: "title", label: "Title", kind: "text", required: true },
          { name: "slug", label: "Web address", kind: "slug", slugFrom: "title", required: true },
          { name: "type", label: "Type", kind: "select", options: postTypes, required: true, half: true },
          { name: "date", label: "Publish date", kind: "date", required: true, half: true },
          { name: "author", label: "Author", kind: "text", placeholder: "e.g. Ms. S. Rudhrasree Darshini, III ECE" },
          { name: "excerpt", label: "Excerpt", kind: "textarea", rows: 2, max: 240, help: "Short teaser for cards." },
          { name: "coverImage", label: "Cover image", kind: "image" },
          { name: "body", label: "Body", kind: "markdown", rows: 16 },
          { name: "attachment", label: "Attached file (newsletter PDF, slides…)", kind: "file" },
          { name: "relatedEventId", label: "Related event", kind: "ref", refType: "event" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- gallery
  {
    type: "galleryAlbum",
    label: "Gallery",
    singular: "Album",
    description: "Photo albums. Link an album to an event and its photos also appear on that event’s page.",
    unique: ["slug"],
    defaults: () => ({ date: new Date().toISOString().slice(0, 10), photos: [], videos: [] }),
    row: (d) => ({ title: s(d.title), subtitle: `${fmtDate(s(d.date))} · ${Array.isArray(d.photos) ? d.photos.length : 0} photos`, image: Array.isArray(d.photos) ? imgUrl(d.photos[0]) : undefined }),
    sort: (a, b) => s(b.date).localeCompare(s(a.date)),
    publicUrl: (d) => `/gallery#${s(d.slug)}`,
    sections: [
      {
        title: "Album",
        fields: [
          { name: "title", label: "Album title", kind: "text", required: true },
          { name: "slug", label: "Web address", kind: "slug", slugFrom: "title", required: true },
          { name: "date", label: "Date", kind: "date", required: true, half: true },
          { name: "eventId", label: "Linked event", kind: "ref", refType: "event", half: true },
          { name: "photos", label: "Photos", kind: "images", help: "Select several photos at once. Add a short description to each for accessibility." },
          {
            name: "videos",
            label: "Videos & reels",
            kind: "list",
            itemLabel: "video",
            fields: [
              { name: "title", label: "Title", kind: "text", half: true },
              { name: "url", label: "YouTube / Instagram link", kind: "url", required: true, half: true },
            ],
          },
        ],
      },
    ],
  },

  // --------------------------------------------------------------- settings
  {
    type: "siteSettings",
    label: "Site settings",
    singular: "Site settings",
    description: "Branch details, home-page numbers, history timeline, contact and social links.",
    singletonId: "siteSettings",
    row: () => ({ title: "Site settings" }),
    sections: [
      {
        title: "Branch",
        fields: [
          { name: "branchName", label: "Branch name", kind: "text", required: true },
          { name: "branchCode", label: "Branch code", kind: "text", half: true },
          { name: "establishedYear", label: "Year established", kind: "number", min: 1950, max: 2100, required: true, half: true },
          { name: "tagline", label: "Tagline", kind: "text", max: 140, help: "Shown under the name on the home page." },
          { name: "vision", label: "Vision", kind: "textarea", rows: 3 },
          { name: "mission", label: "Mission", kind: "textarea", rows: 4 },
          { name: "objectives", label: "Objectives", kind: "strings", itemLabel: "objective" },
        ],
      },
      {
        title: "Home-page numbers",
        fields: [
          {
            name: "stats",
            label: "Numbers strip",
            kind: "group",
            help: "Leave a number empty to hide it or (for events/societies) count automatically.",
            fields: [
              { name: "members", label: "IEEE members", kind: "number", min: 0, half: true },
              { name: "eventsHeld", label: "Events (this year)", kind: "number", min: 0, half: true },
              { name: "awardsWon", label: "Awards won", kind: "number", min: 0, half: true },
              { name: "societies", label: "Societies & councils", kind: "number", min: 0, half: true },
            ],
          },
        ],
      },
      {
        title: "History & recognitions",
        fields: [
          {
            name: "milestones",
            label: "Timeline milestones (About page)",
            kind: "list",
            itemLabel: "milestone",
            fields: [
              { name: "year", label: "Year", kind: "number", required: true, half: true, min: 1950, max: 2100 },
              { name: "title", label: "Title", kind: "text", required: true, half: true },
              { name: "description", label: "Short description", kind: "textarea", rows: 2 },
            ],
          },
          {
            name: "recognitions",
            label: "Recognitions received by the branch",
            kind: "list",
            itemLabel: "recognition",
            fields: [
              { name: "title", label: "Title", kind: "text", required: true },
              { name: "awardedBy", label: "Awarded by", kind: "text", half: true },
              { name: "year", label: "Year", kind: "number", half: true },
            ],
          },
        ],
      },
      {
        title: "Contact & social",
        fields: [
          { name: "contactEmail", label: "Contact email", kind: "email", half: true },
          { name: "contactPhone", label: "Contact phone", kind: "text", half: true },
          { name: "address", label: "Address", kind: "textarea", rows: 3 },
          { name: "mapUrl", label: "Google Maps link", kind: "url" },
          {
            name: "social",
            label: "Social links",
            kind: "group",
            fields: [
              { name: "instagram", label: "Instagram", kind: "url", half: true },
              { name: "linkedin", label: "LinkedIn", kind: "url", half: true },
              { name: "youtube", label: "YouTube", kind: "url", half: true },
              { name: "facebook", label: "Facebook", kind: "url", half: true },
              { name: "x", label: "X (Twitter)", kind: "url", half: true },
              { name: "whatsapp", label: "WhatsApp channel", kind: "url", half: true },
            ],
          },
          {
            name: "mediaCoverage",
            label: "Media coverage (Gallery page)",
            kind: "list",
            itemLabel: "article",
            fields: [
              { name: "title", label: "Headline", kind: "text", required: true },
              { name: "outlet", label: "Publication", kind: "text", half: true },
              { name: "date", label: "Date", kind: "date", half: true },
              { name: "url", label: "Link", kind: "url" },
            ],
          },
          ...linkFields,
        ],
      },
    ],
  },
];

export const contentTypeMap = Object.fromEntries(contentTypes.map((t) => [t.type, t])) as Record<string, ContentType>;

/** Types with list pages in the sidebar (settings has its own link). */
export const listTypes = contentTypes.filter((t) => !t.singletonId);

export function allFields(t: ContentType): Field[] {
  return t.sections.flatMap((sec) => sec.fields);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
