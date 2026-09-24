import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";
import { researchAreas, urlField } from "./shared";

export const publication = defineType({
  name: "publication",
  title: "Publication",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      name: "title",
      title: "Paper title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "authors",
      title: "Authors",
      type: "array",
      description: "One author per item, in the order printed on the paper.",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "venueType",
      title: "Published in",
      type: "string",
      options: {
        list: [
          { title: "Conference", value: "conference" },
          { title: "Journal", value: "journal" },
          { title: "Book chapter", value: "chapter" },
          { title: "Preprint", value: "preprint" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "conference",
    }),
    defineField({
      name: "venue",
      title: "Conference / journal name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Publication year",
      type: "number",
      initialValue: () => new Date().getFullYear(),
      validation: (rule) => rule.required().integer().min(1990).max(2100),
    }),
    defineField({
      name: "doi",
      title: "DOI",
      type: "string",
      description: "Just the DOI, e.g. 10.1109/ACCESS.2026.1234567",
      validation: (rule) =>
        rule.custom((doi) =>
          !doi || /^10\.\d{4,9}\/\S+$/.test(doi) ? true : "Should look like 10.xxxx/…",
        ),
    }),
    urlField("link", "IEEE Xplore / official link"),
    defineField({
      name: "researchArea",
      title: "Research area",
      type: "string",
      options: { list: researchAreas },
    }),
    defineField({
      name: "abstract",
      title: "Abstract",
      type: "blockContent",
    }),
  ],
  orderings: [{ title: "Year, newest first", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }],
  preview: {
    select: { title: "title", venue: "venue", year: "year" },
    prepare: ({ title, venue, year }) => ({ title, subtitle: [venue, year].filter(Boolean).join(" · ") }),
  },
});
