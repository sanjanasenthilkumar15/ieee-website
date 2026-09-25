import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Where the site keeps everything it writes at runtime:
 *   DATA_DIR/site.db      – SQLite database (content, users, applications)
 *   DATA_DIR/uploads/     – photos and files uploaded in the admin panel
 * Back up this one folder and you have backed up the whole site.
 */
function resolveDataDir() {
  const wanted = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
  try {
    fs.mkdirSync(path.join(wanted, "uploads"), { recursive: true });
    fs.accessSync(wanted, fs.constants.W_OK);
    return { dir: wanted, temporary: false };
  } catch {
    // Read-only hosting (e.g. a preview on a serverless platform): fall back
    // to the temp folder so the site still runs. Changes won't persist.
    const tmp = path.join(os.tmpdir(), "ieee-sb-data");
    fs.mkdirSync(path.join(tmp, "uploads"), { recursive: true });
    console.warn(`[data] ${wanted} is not writable — using temporary storage at ${tmp}. Admin changes will not persist.`);
    return { dir: tmp, temporary: true };
  }
}

const resolved = resolveDataDir();

export const DATA_DIR = resolved.dir;
/** True when running on temporary storage (edits may be lost on restart). */
export const STORAGE_IS_TEMPORARY = resolved.temporary;
export const DB_PATH = path.join(DATA_DIR, "site.db");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

/** Session lifetime for admin logins. */
export const SESSION_DAYS = 7;

/** Upload limits. */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
