import { TagsIcon } from "@sanity/icons/Tags";
import { defineField, defineType } from "sanity";
import { imageField, urlField } from "./shared";

export const society = defineType({
  name: "society",
  title: "Society / Council",
  type: "document",
  icon: TagsIcon,
  fields: [
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      description: "e.g. IEEE Computer Society",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortName",
      title: "Short name / acronym",
      type: "string",
      description: "e.g. CS, AP-S, WIE",
    }),
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Society", value: "society" },
          { title: "Council", value: "council" },
          { title: "Affinity group (e.g. WIE)", value: "affinity" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "society",
      validation: (rule) => rule.required(),
    }),
    imageField("logo", "Logo", {
      description: "Official society logo on a white or transparent background.",
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.max(600).warning("Keep it short so the cards stay tidy."),
    }),
    urlField("website", "Official website"),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "kind", media: "logo" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? subtitle[0].toUpperCase() + subtitle.slice(1) : undefined,
      media,
    }),
  },
});
