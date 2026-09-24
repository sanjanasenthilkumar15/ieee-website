/**
 * Sanity connection settings, read from environment variables.
 * Copy .env.example → .env.local and fill in the branch-owned project ID.
 *
 * Until a real project ID is set, a placeholder is used so the site still
 * builds; data-fetching helpers return empty results and the Studio shows
 * a "project not found" screen instead of crashing.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";

/** True once a real Sanity project has been configured. */
export const isSanityConfigured = projectId !== "placeholder";

export const studioBasePath = "/studio";
