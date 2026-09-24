import { defineField } from "sanity";

/**
 * Field helpers used across schemas. Option lists live in src/lib/options.ts.
 */

export {
  achievementCategories,
  departmentShort,
  departments,
  eventTypes,
  postTypes,
  researchAreas,
  yearsOfStudy,
} from "../../lib/options";

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
