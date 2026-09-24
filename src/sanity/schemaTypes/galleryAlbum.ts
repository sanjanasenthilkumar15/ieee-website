import { ImagesIcon } from "@sanity/icons/Images";
import { defineArrayMember, defineField, defineType } from "sanity";
import { slugField } from "./shared";

export const galleryAlbum = defineType({
  name: "galleryAlbum",
  title: "Gallery Album",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "title",
      title: "Album title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    slugField(),
    defineField({
      name: "event",
      title: "Linked event (optional)",
      type: "reference",
      to: [{ type: "event" }],
      description: "Photos in this album will also appear on that event’s page.",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      description: "Drag several images in at once. Add a caption where useful.",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "videos",
      title: "Videos & reels",
      type: "array",
      description: "YouTube or Instagram links. Videos are embedded, not uploaded.",
      of: [
        defineArrayMember({
          type: "object",
          name: "videoLink",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "url",
              title: "YouTube / Instagram URL",
              type: "url",
              validation: (r) =>
                r.required().custom((url) =>
                  !url || /(youtube\.com|youtu\.be|instagram\.com)/.test(url)
                    ? true
                    : "Only YouTube or Instagram links can be embedded.",
                ),
            }),
          ],
          preview: { select: { title: "title", subtitle: "url" } },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Date, newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "date", media: "photos.0", count: "photos.length" },
    prepare: ({ title, date, media }) => ({ title, subtitle: date, media }),
  },
});
