"use client";

/**
 * Sanity Studio configuration, mounted at /studio by
 * src/app/studio/[[...tool]]/page.tsx.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId, studioBasePath } from "./src/sanity/env";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

// Types office bearers should never create by hand from the "+" menu.
const noManualCreate = new Set([...singletonTypes, "membershipApplication"]);

export default defineConfig({
  name: "ieee-sb-rmkec",
  title: "IEEE SB RMKEC — Admin",
  basePath: studioBasePath,
  projectId,
  dataset,

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      // Hide manual-create for singletons / form-generated types
      ...prev.filter((t) => !noManualCreate.has(t.schemaType)),
      // "New member" inside a year list pre-fills that year
      {
        id: "execomMember-by-year",
        title: "Execom member for year",
        schemaType: "execomMember",
        parameters: [{ name: "year", type: "number" }],
        value: (params: { year: number }) => ({ year: params.year, memberType: "student" }),
      },
      // "New post" inside a type list pre-fills that type
      {
        id: "post-by-type",
        title: "Post of type",
        schemaType: "post",
        parameters: [{ name: "type", type: "string" }],
        value: (params: { type: string }) => ({ type: params.type }),
      },
    ],
  },

  document: {
    // Singletons: no duplicate / delete / unpublish
    actions: (prev, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? prev.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : prev,
    newDocumentOptions: (prev) =>
      prev.filter((item) => !noManualCreate.has(item.templateId) && !item.templateId.includes("-by-")),
  },

  plugins: [structureTool({ structure, title: "Content" })],
});
