import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { MAX_FILE_BYTES, MAX_IMAGE_BYTES, UPLOADS_DIR } from "./config";

/**
 * Uploads from the admin panel. Images are auto-rotated, resized to at most
 * 2000px and saved as WebP; other files (PDF, Word, PowerPoint) are stored
 * as-is. Everything lives under DATA_DIR/uploads and is served at /media/….
 */

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const FILE_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export class UploadError extends Error {}

function monthFolder() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function saveImage(file: File) {
  if (!IMAGE_TYPES.has(file.type)) throw new UploadError(`“${file.name}” isn’t a supported image (JPG, PNG, WebP, GIF).`);
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError(`“${file.name}” is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`);
  const input = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  const rel = `${monthFolder()}/${randomUUID()}.webp`;
  await fs.mkdir(path.join(UPLOADS_DIR, path.dirname(rel)), { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, rel), data);
  return { url: `/media/${rel}`, width: info.width, height: info.height };
}

export async function saveFile(file: File) {
  const ext = FILE_TYPES[file.type];
  if (!ext) throw new UploadError(`“${file.name}” isn’t a supported file type (PDF, Word, PowerPoint, Excel, JPG, PNG).`);
  if (file.size > MAX_FILE_BYTES) throw new UploadError(`“${file.name}” is larger than ${MAX_FILE_BYTES / 1024 / 1024} MB.`);
  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "file";
  const rel = `${monthFolder()}/${randomUUID()}-${safeBase}${ext}`;
  await fs.mkdir(path.join(UPLOADS_DIR, path.dirname(rel)), { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, rel), Buffer.from(await file.arrayBuffer()));
  return { url: `/media/${rel}`, name: file.name };
}

/** Resolve a /media/... path safely inside the uploads folder (no ../ escapes). */
export function resolveMediaPath(parts: string[]): string | null {
  const joined = path.resolve(UPLOADS_DIR, ...parts);
  if (!joined.startsWith(UPLOADS_DIR + path.sep)) return null;
  return joined;
}

export const MEDIA_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
