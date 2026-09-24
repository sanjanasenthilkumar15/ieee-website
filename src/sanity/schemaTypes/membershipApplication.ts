import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineField, defineType } from "sanity";
import { departments, yearsOfStudy } from "./shared";

/**
 * Created by the Join Us form on the website (never shown publicly).
 * Applicant fields are read-only in the Studio; office bearers only update
 * the status and internal notes.
 */
export const membershipApplication = defineType({
  name: "membershipApplication",
  title: "Membership Application",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Reviewed", value: "reviewed" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "new",
    }),
    defineField({ name: "name", title: "Name", type: "string", readOnly: true }),
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "phone", title: "Phone", type: "string", readOnly: true }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      options: { list: departments },
      readOnly: true,
    }),
    defineField({
      name: "year",
      title: "Year of study",
      type: "string",
      options: { list: yearsOfStudy },
      readOnly: true,
    }),
    defineField({ name: "reason", title: "Reason for joining", type: "text", rows: 5, readOnly: true }),
    defineField({ name: "submittedAt", title: "Submitted", type: "datetime", readOnly: true }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 3,
      description: "Visible only in the Studio, e.g. “Called on 3 Oct — will pay dues next week”.",
    }),
  ],
  orderings: [
    { title: "Newest first", name: "submittedDesc", by: [{ field: "submittedAt", direction: "desc" }] },
  ],
  preview: {
    select: { name: "name", dept: "department", year: "year", status: "status" },
    prepare: ({ name, dept, year, status }) => ({
      title: name || "Unnamed applicant",
      subtitle: [status === "new" ? "● New" : "Reviewed", dept, year && `Year ${year}`].filter(Boolean).join(" · "),
    }),
  },
});
