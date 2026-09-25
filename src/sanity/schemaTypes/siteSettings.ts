import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";
import { urlField } from "./shared";

/**
 * Singleton: one document holding branch-wide settings.
 * The Studio sidebar opens this directly (see structure.ts); it cannot be
 * duplicated or deleted.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "branch", title: "Branch", default: true },
    { name: "stats", title: "Home-page numbers" },
    { name: "history", title: "History & recognitions" },
    { name: "contact", title: "Contact & social" },
  ],
  fields: [
    defineField({
      name: "branchName",
      title: "Branch name",
      type: "string",
      group: "branch",
      initialValue: "IEEE Student Branch, R.M.K. Engineering College",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "branchCode",
      title: "Branch code",
      type: "string",
      group: "branch",
      initialValue: "STB61871",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "branch",
      description: "One line shown under the name on the home page.",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: "establishedYear",
      title: "Year established",
      type: "number",
      group: "branch",
      initialValue: 2009,
      validation: (rule) => rule.required().integer().min(1990).max(2100),
    }),
    defineField({
      name: "vision",
      title: "Vision",
      type: "text",
      rows: 3,
      group: "branch",
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "text",
      rows: 4,
      group: "branch",
    }),
    defineField({
      name: "objectives",
      title: "Objectives",
      type: "array",
      group: "branch",
      of: [defineArrayMember({ type: "string" })],
      description: "One objective per item.",
    }),

    // ---- Stats strip ----
    defineField({
      name: "stats",
      title: "Home-page numbers",
      type: "object",
      group: "stats",
      description: "Shown in the animated number strip on the home page.",
      fields: [
        defineField({ name: "members", title: "IEEE members", type: "number", validation: (r) => r.min(0).integer() }),
        defineField({ name: "eventsHeld", title: "Events held", type: "number", validation: (r) => r.min(0).integer() }),
        defineField({ name: "awardsWon", title: "Awards won", type: "number", validation: (r) => r.min(0).integer() }),
        defineField({
          name: "societies",
          title: "Societies & councils",
          type: "number",
          description: "Leave empty to count Society documents automatically.",
          validation: (r) => r.min(0).integer(),
        }),
      ],
    }),

    // ---- History ----
    defineField({
      name: "milestones",
      title: "History & milestones",
      type: "array",
      group: "history",
      description:
        "Drives the timeline on the About page. Add a new item each year; the timeline extends automatically.",
      of: [
        defineArrayMember({
          type: "object",
          name: "milestone",
          fields: [
            defineField({
              name: "year",
              title: "Year",
              type: "number",
              validation: (r) => r.required().integer().min(1990).max(2100),
            }),
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "description", title: "Short description", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "title", subtitle: "year" } },
        }),
      ],
    }),
    defineField({
      name: "recognitions",
      title: "Recognitions",
      type: "array",
      group: "history",
      description: "Awards or recognitions the branch itself has received.",
      of: [
        defineArrayMember({
          type: "object",
          name: "recognition",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "awardedBy", title: "Awarded by", type: "string" }),
            defineField({ name: "year", title: "Year", type: "number" }),
          ],
          preview: { select: { title: "title", subtitle: "awardedBy" } },
        }),
      ],
    }),

    // ---- Contact ----
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      group: "contact",
      description: "Use a branch-owned address, not a personal one.",
      validation: (rule) => rule.email(),
    }),
    defineField({ name: "contactPhone", title: "Contact phone", type: "string", group: "contact" }),
    defineField({ name: "address", title: "Address", type: "text", rows: 3, group: "contact" }),
    { ...urlField("mapUrl", "Google Maps link"), group: "contact" },
    defineField({
      name: "social",
      title: "Social links",
      type: "object",
      group: "contact",
      fields: [
        urlField("instagram", "Instagram"),
        urlField("linkedin", "LinkedIn"),
        urlField("youtube", "YouTube"),
        urlField("facebook", "Facebook"),
        urlField("x", "X (Twitter)"),
        urlField("whatsapp", "WhatsApp channel"),
      ],
    }),
    defineField({
      name: "mediaCoverage",
      title: "Media coverage",
      type: "array",
      group: "contact",
      description: "News articles or features about the branch (listed on the Gallery page).",
      of: [
        defineArrayMember({
          type: "object",
          name: "coverage",
          fields: [
            defineField({ name: "title", title: "Headline", type: "string", validation: (r) => r.required() }),
            defineField({ name: "outlet", title: "Publication / outlet", type: "string" }),
            defineField({ name: "date", title: "Date", type: "date" }),
            urlField("url", "Link"),
          ],
          preview: { select: { title: "title", subtitle: "outlet" } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
