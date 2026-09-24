import { StarIcon } from "@sanity/icons/Star";
import { defineField, defineType } from "sanity";
import { achievementCategories, departments, imageField, yearsOfStudy } from "./shared";

/**
 * Achievements are listed by category, not by department. Department and
 * year are simply details about the member.
 */
export const achievement = defineType({
  name: "achievement",
  title: "Achievement",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Achievement",
      type: "string",
      description: "e.g. “Winner — Smart India Hackathon 2026 (Software Edition)”",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Sets the coloured stripe on the card and the filter on the Achievements page.",
      options: { list: achievementCategories },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "memberName",
      title: "Member name(s)",
      type: "string",
      description: "For teams, list names separated by commas.",
      validation: (rule) => rule.required(),
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
    }),
    defineField({
      name: "organizer",
      title: "Event / organiser",
      type: "string",
      description: "e.g. “IEEE Madras Section” or “Ministry of Education, Govt. of India”",
    }),
    defineField({
      name: "position",
      title: "Position / recognition",
      type: "string",
      description: "e.g. 1st Prize, Finalist, Best Paper Award, Reviewer",
    }),
    defineField({
      name: "projectTitle",
      title: "Project or paper title (optional)",
      type: "string",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "proof",
      title: "Certificate / proof",
      type: "file",
      description: "PDF or image of the certificate. Kept for records; not shown publicly unless enabled below.",
      options: { accept: ".pdf,image/*" },
    }),
    defineField({
      name: "showProof",
      title: "Show certificate link publicly",
      type: "boolean",
      initialValue: false,
    }),
    imageField("photo", "Photo (optional)"),
    defineField({
      name: "featured",
      title: "Highlight on home page",
      type: "boolean",
      description: "The three most recent highlighted achievements appear on the home page.",
      initialValue: false,
    }),
  ],
  orderings: [{ title: "Date, newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", member: "memberName", category: "category", media: "photo" },
    prepare: ({ title, member, category, media }) => ({
      title,
      subtitle: [member, category].filter(Boolean).join(" · "),
      media,
    }),
  },
});
