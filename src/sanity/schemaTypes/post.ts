import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineField, defineType } from "sanity";
import { imageField, postTypes, slugField } from "./shared";

export const post = defineType({
  name: "post",
  title: "Blog / Newsletter / Resource",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    slugField(),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: postTypes },
      initialValue: "article",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "Name as it should appear, e.g. “Ms. S. Rudhrasree, III ECE”.",
    }),
    defineField({
      name: "date",
      title: "Publish date",
      type: "date",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short teaser for cards (1–2 sentences).",
      validation: (rule) => rule.max(240),
    }),
    imageField("coverImage", "Cover image"),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
    defineField({
      name: "attachment",
      title: "Attached file (optional)",
      type: "file",
      description: "Newsletter PDF, slides, or guide for download.",
    }),
    defineField({
      name: "relatedEvent",
      title: "Related event (optional)",
      type: "reference",
      to: [{ type: "event" }],
      description: "For event reports: link the event this post covers.",
    }),
  ],
  orderings: [{ title: "Date, newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", type: "type", date: "date", media: "coverImage" },
    prepare: ({ title, type, date, media }) => ({
      title,
      subtitle: [postTypes.find((t) => t.value === type)?.title, date].filter(Boolean).join(" · "),
      media,
    }),
  },
});
