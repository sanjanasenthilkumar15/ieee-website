import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { MEDIA_TYPES, resolveMediaPath } from "@/server/media";

/** Serves files uploaded in the admin panel (DATA_DIR/uploads) at /media/…. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = resolveMediaPath((await params).path);
  if (!file) return new Response("Not found", { status: 404 });
  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(file);
    if (!stat.isFile()) throw new Error();
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const ext = path.extname(file).toLowerCase();
  const type = MEDIA_TYPES[ext] ?? "application/octet-stream";
  const isImage = type.startsWith("image/");
  const body = Readable.toWeb(fs.createReadStream(file)) as ReadableStream;
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(stat.size),
      // File names are unique, so they can be cached forever
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": isImage || ext === ".pdf" ? "inline" : `attachment; filename="${path.basename(file)}"`,
    },
  });
}
