import { UsersIcon } from "@sanity/icons/Users";
import { defineField, defineType } from "sanity";
import { departments, imageField, urlField, yearsOfStudy } from "./shared";

export const execomMember = defineType({
  name: "execomMember",
  title: "Execom Member",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Execom year",
      type: "number",
      description:
        "The committee this person served on, e.g. 2026. Adding members with a new year makes a “Past Committees” selector appear on the site automatically.",
      initialValue: () => new Date().getFullYear(),
      validation: (rule) => rule.required().integer().min(2026).max(2100),
    }),
    defineField({
      name: "role",
      title: "Role / designation",
      type: "string",
      description: "e.g. Chair, Vice Chair, Secretary, Treasurer, Branch Counsellor, WIE Chair.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "memberType",
      title: "Member type",
      type: "string",
      options: {
        list: [
          { title: "Student office bearer", value: "student" },
          { title: "Faculty (Counsellor / Advisor)", value: "faculty" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "student",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first (e.g. Chair = 1, Vice Chair = 2). Leave empty to sort by name.",
    }),
    imageField("photo", "Photo", {
      description: "Head-and-shoulders photo, ideally square, at least 600×600px.",
    }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      options: { list: departments },
    }),
    defineField({
      name: "yearOfStudy",
      title: "Year of study",
      type: "string",
      options: { list: yearsOfStudy },
      hidden: ({ document }) => document?.memberType === "faculty",
    }),
    defineField({
      name: "society",
      title: "Society / council (optional)",
      type: "reference",
      to: [{ type: "society" }],
      description: "Only for society or council chapter office bearers, e.g. Chair of Computer Society.",
    }),
    urlField("linkedin", "LinkedIn URL"),
    urlField("ieeeProfile", "IEEE Collabratec / profile URL"),
  ],
  orderings: [
    {
      title: "Committee year, then display order",
      name: "yearOrder",
      by: [
        { field: "year", direction: "desc" },
        { field: "order", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", role: "role", year: "year", media: "photo" },
    prepare: ({ title, role, year, media }) => ({
      title,
      subtitle: [role, year].filter(Boolean).join(" · "),
      media,
    }),
  },
});
