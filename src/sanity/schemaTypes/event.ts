import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineArrayMember, defineField, defineType } from "sanity";
import { eventTypes, imageField, slugField, urlField } from "./shared";

/**
 * Upcoming vs past is worked out from the dates (no manual status to keep
 * in sync). Photos live in a Gallery Album that links back to this event,
 * so each photo is uploaded once and shows on both the event page and the
 * Gallery page.
 */
export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "people", title: "Speakers & agenda" },
    { name: "media", title: "Poster & links" },
    { name: "report", title: "Report (after the event)" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Event title",
      type: "string",
      group: "basics",
      validation: (rule) => rule.required(),
    }),
    { ...slugField(), group: "basics" },
    defineField({
      name: "eventType",
      title: "Event type",
      type: "string",
      group: "basics",
      description: "Sets the coloured stripe on the event card.",
      options: { list: eventTypes },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seriesLabel",
      title: "Series label (optional)",
      type: "string",
      group: "basics",
      description: "e.g. “Weekly Webinar #3”. Shown above the title.",
    }),
    defineField({
      name: "startDate",
      title: "Starts",
      type: "datetime",
      group: "basics",
      description: "Date and start time (IST). Decides whether the event shows as Upcoming or Past.",
      options: { timeStep: 15 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "Ends (optional)",
      type: "datetime",
      group: "basics",
      description: "Only needed for multi-day events or to show an end time.",
      options: { timeStep: 15 },
      validation: (rule) =>
        rule.custom((end, ctx) => {
          const start = (ctx.document as { startDate?: string } | undefined)?.startDate;
          if (end && start && new Date(end) < new Date(start)) return "End must be after the start.";
          return true;
        }),
    }),
    defineField({
      name: "hideTime",
      title: "Date only (hide the time)",
      type: "boolean",
      group: "basics",
      description: "Tick this if the start time isn’t known or doesn’t matter; only the date is shown.",
      initialValue: false,
    }),
    defineField({
      name: "mode",
      title: "Mode",
      type: "string",
      group: "basics",
      options: {
        list: [
          { title: "In person", value: "in-person" },
          { title: "Online", value: "online" },
          { title: "Hybrid", value: "hybrid" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "in-person",
    }),
    defineField({
      name: "venue",
      title: "Venue / platform",
      type: "string",
      group: "basics",
      description: "e.g. “Seminar Hall, Main Block” or “Zoom” / “YouTube Live”.",
    }),
    defineField({
      name: "societies",
      title: "Co-hosting societies / councils",
      type: "array",
      group: "basics",
      of: [defineArrayMember({ type: "reference", to: [{ type: "society" }] })],
    }),
    defineField({
      name: "summary",
      title: "Short summary",
      type: "text",
      rows: 3,
      group: "basics",
      description: "One or two sentences for event cards and search results.",
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "blockContent",
      group: "basics",
    }),
    defineField({
      name: "objective",
      title: "Objective",
      type: "text",
      rows: 3,
      group: "basics",
    }),
    defineField({
      name: "featured",
      title: "Feature on home page",
      type: "boolean",
      group: "basics",
      description: "If several upcoming events are featured, the soonest one is shown.",
      initialValue: false,
    }),

    // ---- People ----
    defineField({
      name: "speakers",
      title: "Speakers / chief guests",
      type: "array",
      group: "people",
      of: [
        defineArrayMember({
          type: "object",
          name: "speaker",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "designation", title: "Designation", type: "string" }),
            defineField({ name: "affiliation", title: "Organisation", type: "string" }),
            defineField({
              name: "role",
              title: "Role at this event",
              type: "string",
              options: {
                list: ["Speaker", "Chief Guest", "Guest of Honour", "Resource Person", "Judge", "Moderator"],
              },
              initialValue: "Speaker",
            }),
            imageField("photo", "Photo"),
          ],
          preview: {
            select: { title: "name", subtitle: "affiliation", media: "photo" },
          },
        }),
      ],
    }),
    defineField({
      name: "agenda",
      title: "Agenda",
      type: "array",
      group: "people",
      of: [
        defineArrayMember({
          type: "object",
          name: "agendaItem",
          fields: [
            defineField({ name: "time", title: "Time", type: "string", description: "e.g. 6:30 PM" }),
            defineField({ name: "title", title: "Item", type: "string", validation: (r) => r.required() }),
            defineField({ name: "detail", title: "Detail (optional)", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "time" } },
        }),
      ],
    }),

    // ---- Media & links ----
    imageField("poster", "Poster", { group: "media" }),
    { ...urlField("registrationUrl", "Registration link", "Shown only while the event is upcoming."), group: "media" },
    { ...urlField("joinUrl", "Live stream / meeting link", "YouTube Live, Zoom or Meet link."), group: "media" },
    { ...urlField("recordingUrl", "Recording link", "YouTube link to the recording, if available."), group: "media" },
    { ...urlField("socialPostUrl", "Social media post", "Instagram or LinkedIn post about the event."), group: "media" },

    // ---- Report ----
    defineField({
      name: "report",
      title: "Event report",
      type: "blockContent",
      group: "report",
      description: "Write-up after the event: what happened, attendance, outcomes.",
    }),
    defineField({
      name: "reportFile",
      title: "Report file (PDF)",
      type: "file",
      group: "report",
      options: { accept: ".pdf,.doc,.docx" },
    }),
    defineField({
      name: "attendance",
      title: "Attendance",
      type: "number",
      group: "report",
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
  orderings: [
    { title: "Date, newest first", name: "dateDesc", by: [{ field: "startDate", direction: "desc" }] },
    { title: "Date, oldest first", name: "dateAsc", by: [{ field: "startDate", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", date: "startDate", series: "seriesLabel", media: "poster" },
    prepare: ({ title, date, series, media }) => ({
      title,
      subtitle: [
        series,
        date
          ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
          : "No date",
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
