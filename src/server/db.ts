import "server-only";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DATA_DIR, DB_PATH, UPLOADS_DIR } from "./config";
import { buildSeedDocuments } from "./seed";

/**
 * Single SQLite file holding all site data. Uses Node's built-in SQLite
 * (no native packages to compile), so it runs anywhere Node 22.13+ runs.
 *
 * Content is stored as JSON documents (one row per event, member, post…)
 * in the same shapes the pages use, which keeps the admin generic.
 */

type Row = { id: string; type: string; data: string; created_at: string; updated_at: string; updated_by: string | null };

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS documents (
     id TEXT PRIMARY KEY,
     type TEXT NOT NULL,
     data TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now')),
     updated_at TEXT NOT NULL DEFAULT (datetime('now')),
     updated_by TEXT
   );
   CREATE INDEX IF NOT EXISTS documents_type ON documents(type);
   CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE COLLATE NOCASE,
     name TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('admin','editor')),
     password_hash TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now')),
     last_login_at TEXT
   );
   CREATE TABLE IF NOT EXISTS sessions (
     token_hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     expires_at TEXT NOT NULL
   );
   CREATE TABLE IF NOT EXISTS activity (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     at TEXT NOT NULL DEFAULT (datetime('now')),
     user_email TEXT,
     action TEXT NOT NULL,
     target TEXT
   );`,
  // v2: signed session cookies; this table only remembers signed-out sessions
  `DROP TABLE IF EXISTS sessions;
   CREATE TABLE IF NOT EXISTS revoked_sessions (
     sid TEXT PRIMARY KEY,
     expires_at INTEGER NOT NULL
   );`,
];

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const conn = new DatabaseSync(DB_PATH);
  conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  conn.exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)");
  const current = Number(
    (conn.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value?: string } | undefined)?.value ?? 0,
  );
  for (let v = current; v < MIGRATIONS.length; v++) {
    conn.exec(MIGRATIONS[v]);
    conn.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)").run(String(v + 1));
  }
  // First start: load the starter content (real 2026 events, Execom, societies…)
  const seeded = conn.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
  if (!seeded) {
    const insert = conn.prepare("INSERT OR IGNORE INTO documents (id, type, data) VALUES (?, ?, ?)");
    conn.exec("BEGIN");
    for (const d of buildSeedDocuments()) insert.run(d.id, d.type, JSON.stringify(d.data));
    conn.prepare("INSERT INTO meta (key, value) VALUES ('seeded', datetime('now'))").run();
    conn.exec("COMMIT");
  }
  db = conn;
  return conn;
}

export { DATA_DIR };

// ---------- documents ----------

export function listDocs<T>(type: string): T[] {
  const rows = getDb().prepare("SELECT data FROM documents WHERE type = ?").all(type) as Pick<Row, "data">[];
  return rows.map((r) => JSON.parse(r.data) as T);
}

export function listDocRows(type: string) {
  const rows = getDb()
    .prepare("SELECT id, data, updated_at, updated_by FROM documents WHERE type = ? ORDER BY updated_at DESC")
    .all(type) as Pick<Row, "id" | "data" | "updated_at" | "updated_by">[];
  return rows.map((r) => ({ id: r.id, data: JSON.parse(r.data) as Record<string, unknown>, updatedAt: r.updated_at, updatedBy: r.updated_by }));
}

export function getDoc<T>(id: string): T | null {
  const row = getDb().prepare("SELECT data FROM documents WHERE id = ?").get(id) as Pick<Row, "data"> | undefined;
  return row ? (JSON.parse(row.data) as T) : null;
}

export function saveDoc(type: string, id: string, data: object, userEmail?: string) {
  getDb()
    .prepare(
      `INSERT INTO documents (id, type, data, updated_by) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now'), updated_by = excluded.updated_by`,
    )
    .run(id, type, JSON.stringify({ ...data, id }), userEmail ?? null);
}

export function deleteDoc(id: string) {
  getDb().prepare("DELETE FROM documents WHERE id = ?").run(id);
}

export function countDocs(type: string, where?: { field: string; equals: string }) {
  if (!where) return (getDb().prepare("SELECT COUNT(*) AS n FROM documents WHERE type = ?").get(type) as { n: number }).n;
  return (
    getDb()
      .prepare(`SELECT COUNT(*) AS n FROM documents WHERE type = ? AND json_extract(data, ?) = ?`)
      .get(type, `$.${where.field}`, where.equals) as { n: number }
  ).n;
}

export function logActivity(userEmail: string | null, action: string, target?: string) {
  getDb().prepare("INSERT INTO activity (user_email, action, target) VALUES (?, ?, ?)").run(userEmail, action, target ?? null);
}

export function recentActivity(limit = 12) {
  return getDb()
    .prepare("SELECT at, user_email, action, target FROM activity ORDER BY id DESC LIMIT ?")
    .all(limit) as { at: string; user_email: string | null; action: string; target: string | null }[];
}
