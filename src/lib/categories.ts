/**
 * Category → stripe colour mapping for Event and Achievement cards.
 * Colours are defined as tokens in globals.css (--color-cat-*); this file
 * maps the Sanity category values onto them so cards never hardcode hex.
 * Keep in sync with the option lists in src/lib/options.ts.
 */

export const achievementCategories = [
  "hackathon",
  "competition",
  "award",
  "research",
  "reviewer",
  "other",
] as const;
export type AchievementCategory = (typeof achievementCategories)[number];

export const eventTypes = [
  "webinar",
  "workshop",
  "hackathon",
  "competition",
  "meeting",
  "membership",
  "ceremony",
  "other",
] as const;
export type EventType = (typeof eventTypes)[number];

type Category = AchievementCategory | EventType;

export const categoryMeta: Record<Category, { label: string; color: string }> = {
  hackathon: { label: "Hackathon", color: "var(--color-cat-hackathon)" },
  competition: { label: "Competition", color: "var(--color-cat-competition)" },
  award: { label: "Award", color: "var(--color-cat-award)" },
  research: { label: "Research", color: "var(--color-cat-research)" },
  reviewer: { label: "Reviewer Role", color: "var(--color-cat-reviewer)" },
  webinar: { label: "Webinar", color: "var(--color-ieee-blue)" },
  workshop: { label: "Workshop", color: "var(--color-cat-workshop)" },
  meeting: { label: "Meeting", color: "var(--color-cat-other)" },
  membership: { label: "Membership Drive", color: "var(--color-rmkec-green)" },
  ceremony: { label: "Ceremony", color: "var(--color-cat-award)" },
  other: { label: "Other", color: "var(--color-cat-other)" },
};

export function categoryColor(cat: string | undefined): string {
  return categoryMeta[cat as Category]?.color ?? categoryMeta.other.color;
}
