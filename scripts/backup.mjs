#!/usr/bin/env node
/**
 * Back up the whole site: database + uploaded files.
 *
 *   npm run backup                 → ./backups/2026-09-25_1830/
 *   BACKUP_DIR=/mnt/usb npm run backup
 *
 * Safe to run while the site is live. To restore, stop the site and copy
 * site.db and the uploads folder from a backup into DATA_DIR.
 */
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
try { process.loadEnvFile(".env"); } catch {} // optional .env next to the project

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
const BACKUP_ROOT = path.resolve(process.env.BACKUP_DIR || path.join(process.cwd(), "backups"));
const stamp = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "");
const dest = path.join(BACKUP_ROOT, stamp);

const dbFile = path.join(DATA_DIR, "site.db");
if (!fs.existsSync(dbFile)) {
  console.error(`No database found at ${dbFile}`);
  process.exit(1);
}
fs.mkdirSync(dest, { recursive: true });
// VACUUM INTO makes a consistent copy even while the site is writing.
const db = new DatabaseSync(dbFile);
db.exec(`VACUUM INTO '${path.join(dest, "site.db").replace(/'/g, "''")}'`);
db.close();
fs.cpSync(path.join(DATA_DIR, "uploads"), path.join(dest, "uploads"), { recursive: true });

// Keep the 14 most recent backups
const all = fs.readdirSync(BACKUP_ROOT).filter((d) => /^\d{4}-\d{2}-\d{2}_\d{4}$/.test(d)).sort();
for (const old of all.slice(0, Math.max(0, all.length - 14))) fs.rmSync(path.join(BACKUP_ROOT, old), { recursive: true, force: true });

console.log(`✔ Backup written to ${dest}`);
