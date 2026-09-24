import type { SchemaTypeDefinition } from "sanity";
import { achievement } from "./achievement";
import { event } from "./event";
import { execomMember } from "./execomMember";
import { galleryAlbum } from "./galleryAlbum";
import { membershipApplication } from "./membershipApplication";
import { blockContent } from "./objects/blockContent";
import { post } from "./post";
import { publication } from "./publication";
import { siteSettings } from "./siteSettings";
import { society } from "./society";

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  siteSettings,
  execomMember,
  society,
  event,
  achievement,
  publication,
  post,
  galleryAlbum,
  membershipApplication,
  // objects
  blockContent,
];

/** Document types that must exist exactly once. */
export const singletonTypes = new Set(["siteSettings"]);
