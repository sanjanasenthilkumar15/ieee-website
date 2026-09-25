import { getDb } from "@/server/db";
import { STORAGE_IS_TEMPORARY } from "@/server/config";

/** GET /api/health — for uptime monitors. 200 when the database is reachable. */
export async function GET() {
  try {
    getDb().prepare("SELECT 1").get();
    return Response.json({ ok: true, storage: STORAGE_IS_TEMPORARY ? "temporary" : "persistent" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 503 });
  }
}
