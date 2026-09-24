import { defineField } from "sanity";

/**
 * Shared option lists and field helpers used across schemas.
 * Edit the lists here and every schema that uses them updates.
 */

// TODO(branch): confirm this matches RMKEC's current department list.
export const departments = [
  { title: "Computer Science and Engineering (CSE)", value: "CSE" },
  { title: "Computer Science and Design (CSD)", value: "CSD" },
  { title: "Artificial Intelligence and Data Science (AI&DS)", value: "AIDS" },
  { title: "Information Technology (IT)", value: "IT" },
  { title: "Electronics and Communication Engineering (ECE)", value: "ECE" },
  { title: "ECE (VLSI Design and Technology)", value: "ECE-VLSI" },
  { title: "Electrical and Electronics Engineering (EEE)", value: "EEE" },
  { title: "Electronics and Instrumentation Engineering (EIE)", value: "EIE" },
  { title: "Mechanical Engineering", value: "MECH" },
  { title: "Civil Engineering", value: "CIVIL" },
  { title: "Science and Humanities", value: "S&H" },
  { title: "Other", value: "OTHER" },
];

export const yearsOfStudy = [
  { title: "1st year", value: "1" },
  { title: "2nd year", value: "2" },
  { title: "3rd year", value: "3" },
  { title: "4th year", value: "4" },
  { title: "Postgraduate", value: "PG" },
  { title: "Faculty / Staff", value: "faculty" },
];

/** Event types drive the coloured stripe on event cards. Keep in sync with src/lib/categories.ts. */
export const eventTypes = [
  { title: "Webinar / Online talk", value: "webinar" },
  { title: "Workshop / Hands-on session", value: "workshop" },
  { title: "Hackathon", value: "hackathon" },
  { title: "Competition / Contest", value: "competition" },
  { title: "Meeting", value: "meeting" },
  { title: "Membership drive / Outreach", value: "membership" },
  { title: "Inauguration / Ceremony", value: "ceremony" },
  { title: "Other", value: "other" },
];

/** Achievement categories drive the coloured stripe on achievement cards. */
export const achievementCategories = [
  { title: "Hackathon", value: "hackathon" },
  { title: "Competition", value: "competition" },
  { title: "Award", value: "award" },
  { title: "Research (paper / patent / grant)", value: "research" },
  { title: "Reviewer role", value: "reviewer" },
  { title: "Other", value: "other" },
];

export const postTypes = [
  { title: "Article", value: "article" },
  { title: "Event Report", value: "event-report" },
  { title: "Student Story", value: "student-story" },
  { title: "Newsletter", value: "newsletter" },
  { title: "Resource (guide, slides, notes)", value: "resource" },
];

export const researchAreas = [
  { title: "Artificial Intelligence & Machine Learning", value: "ai-ml" },
  { title: "Communications & Networking", value: "communications" },
  { title: "Signal & Image Processing", value: "signal-processing" },
  { title: "VLSI & Embedded Systems", value: "vlsi-embedded" },
  { title: "Power & Energy Systems", value: "power-energy" },
  { title: "Photonics & Optics", value: "photonics" },
  { title: "Antennas & Electromagnetics", value: "antennas" },
  { title: "Biomedical Engineering", value: "biomedical" },
  { title: "Robotics & Automation", value: "robotics" },
  { title: "IoT & Sensors", value: "iot-sensors" },
  { title: "Cloud & Distributed Computing", value: "cloud" },
  { title: "Cybersecurity", value: "security" },
  { title: "Other", value: "other" },
];

/** An image field with a required-ish "Alt text" sub-field (warning, not error). */
export function imageField(
  name: string,
  title: string,
  opts: { description?: string; required?: boolean; group?: string } = {},
) {
  return defineField({
    name,
    title,
    type: "image",
    description: opts.description,
    group: opts.group,
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        description:
          "Describe the image for screen readers, e.g. “Execom members at the 2026 inauguration”.",
        validation: (rule) => rule.warning().required(),
      }),
    ],
    validation: opts.required ? (rule) => rule.required() : undefined,
  });
}

/** A URL field that accepts only http(s) links. */
export function urlField(name: string, title: string, description?: string) {
  return defineField({
    name,
    title,
    type: "url",
    description,
    validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
  });
}

/** Slug generated from the title field. */
export function slugField(source = "title") {
  return defineField({
    name: "slug",
    title: "URL slug",
    type: "slug",
    description: "Part of the page address. Click “Generate” after entering the title.",
    options: { source, maxLength: 96 },
    validation: (rule) => rule.required(),
  });
}
