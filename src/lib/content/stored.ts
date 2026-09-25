import type {
  Achievement,
  Album,
  Application,
  EventItem,
  ExecomMember,
  FileRef,
  Post,
  Publication,
  SiteSettings,
  Society,
} from "./types";

/**
 * Exact shapes saved in the database. References between documents are
 * stored as IDs and resolved when pages read them, so renaming a society or
 * event updates everywhere it is linked.
 */
export type StoredSettings = SiteSettings;
export type StoredSociety = Society & { order?: number };
export type StoredExecomMember = ExecomMember;
export type StoredEvent = Omit<EventItem, "societies"> & { societyIds: string[] };
export type StoredAchievement = Omit<Achievement, "proofUrl"> & { proof?: FileRef; showProof?: boolean };
export type StoredPublication = Publication;
export type StoredPost = Omit<Post, "relatedEvent" | "attachmentUrl" | "attachmentName"> & {
  relatedEventId?: string;
  attachment?: FileRef;
};
export type StoredAlbum = Omit<Album, "event"> & { eventId?: string };
export type StoredApplication = Application;

export type StoredDocs = {
  siteSettings: StoredSettings;
  society: StoredSociety;
  execomMember: StoredExecomMember;
  event: StoredEvent;
  achievement: StoredAchievement;
  publication: StoredPublication;
  post: StoredPost;
  galleryAlbum: StoredAlbum;
  application: StoredApplication;
};
