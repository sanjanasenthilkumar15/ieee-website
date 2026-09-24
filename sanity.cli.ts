/**
 * Sanity CLI config — lets you run `npx sanity …` commands (dataset import,
 * schema validate, typegen, deploy) from the project root.
 */
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
});
