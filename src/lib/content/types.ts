import type { PortableTextBlock } from "next-sanity";

/**
 * Normalised content shapes used by every page. Both data sources — Sanity
 * (GROQ projections in queries.ts) and the offline JSON fallback (local.ts)
 * — return exactly these shapes, so components never care which is active.
 */

export type Img = {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Tiny blurred placeholder (Sanity only). */
  lqip?: string;
};

export type RichText = PortableTextBlock[];

export type SiteSettings = {
  branchName: string;
  branchCode: string;
  tagline?: string;
  establishedYear: number;
  vision?: string;
  mission?: string;
  objectives: string[];
  stats: { members?: number; eventsHeld?: number; awardsWon?: number; societies?: number };
  milestones: { year: number; title: string; description?: string }[];
  recognitions: { title: string; awardedBy?: string; year?: number }[];
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  mapUrl?: string;
  social: Partial<Record<"instagram" | "linkedin" | "youtube" | "facebook" | "x" | "whatsapp", string>>;
  mediaCoverage: { title: string; outlet?: string; date?: string; url?: string }[];
};

export type Society = {
  id: string;
  name: string;
  shortName?: string;
  kind: "society" | "council" | "affinity";
  description?: string;
  website?: string;
  logo?: Img;
};

export type ExecomMember = {
  id: string;
  name: string;
  year: number;
  role: string;
  memberType: "student" | "faculty";
  section?: "core" | "chairs";
  order?: number;
  department?: string;
  yearOfStudy?: string;
  photo?: Img;
  linkedin?: string;
  ieeeProfile?: string;
};

export type Speaker = {
  name: string;
  designation?: string;
  affiliation?: string;
  role?: string;
  photo?: Img;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  seriesLabel?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  hideTime: boolean;
  mode?: "in-person" | "online" | "hybrid";
  venue?: string;
  summary?: string;
  featured: boolean;
  societies: Pick<Society, "id" | "name" | "shortName">[];
  poster?: Img;
  speakers: Speaker[];
  // detail-only fields
  description?: RichText;
  objective?: string;
  agenda?: { time?: string; title: string; detail?: string }[];
  registrationUrl?: string;
  joinUrl?: string;
  recordingUrl?: string;
  socialPostUrl?: string;
  report?: RichText;
  reportFileUrl?: string;
  attendance?: number;
};

export type Achievement = {
  id: string;
  title: string;
  category: string;
  memberName: string;
  department?: string;
  yearOfStudy?: string;
  organizer?: string;
  position?: string;
  projectTitle?: string;
  date: string;
  photo?: Img;
  proofUrl?: string;
  featured: boolean;
};

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  venueType?: string;
  venue: string;
  year: number;
  doi?: string;
  link?: string;
  researchArea?: string;
  abstract?: RichText;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  type: string;
  author?: string;
  date: string;
  excerpt?: string;
  coverImage?: Img;
  body?: RichText;
  attachmentUrl?: string;
  attachmentName?: string;
  relatedEvent?: { slug: string; title: string };
};

export type Album = {
  id: string;
  slug: string;
  title: string;
  date: string;
  event?: { slug: string; title: string };
  photos: (Img & { caption?: string })[];
  videos: { title?: string; url: string }[];
};
