#!/usr/bin/env node
/**
 * Create (or reset the password of) an admin account.
 *
 *   npm run admin:create
 *
 * Run it on the server, in the project folder. It asks for email, name and
 * password. Uses the same DATA_DIR as the site (default: ./data).
 */
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { DatabaseSync } from "node:sqlite";
try { process.loadEnvFile(".env"); } catch {} // optional .env next to the project

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
fs.mkdirSync(path.join(DATA_DIR, "uploads"), { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, "site.db"));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','editor')), password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), last_login_at TEXT)`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));
function askHidden(q) {
  return new Promise((res) => {
    const onData = (ch) => {
      const c = ch.toString();
      if (c === "\n" || c === "\r" || c === "\u0004") process.stdin.removeListener("data", onData);
      else {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(q + "*".repeat(rl.line.length));
      }
    };
    process.stdin.on("data", onData);
    rl.question(q, (a) => res(a));
  });
}

const hash = (pw) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 }).toString("base64")}`;
};

console.log(`\nIEEE SB RMKEC — create admin account\nDatabase: ${path.join(DATA_DIR, "site.db")}\n`);
const email = (process.env.ADMIN_EMAIL || (await ask("Email: "))).toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error("That doesn't look like an email address."); process.exit(1); }
const existing = db.prepare("SELECT id, name FROM users WHERE email = ?").get(email);
const name = existing ? existing.name : process.env.ADMIN_NAME || (await ask("Full name: "));
const password = process.env.ADMIN_PASSWORD || (await askHidden("Password (min 10 characters): "));
rl.close();
if (password.length < 10) { console.error("Password must be at least 10 characters."); process.exit(1); }

if (existing) {
  db.prepare("UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?").run(hash(password), existing.id);
  db.exec("CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL)");
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(existing.id);
  console.log(`\n✔ Password reset for ${email} (role: admin).`);
} else {
  db.prepare("INSERT INTO users (id, email, name, role, password_hash) VALUES (?, ?, ?, 'admin', ?)").run(randomUUID(), email, name, hash(password));
  console.log(`\n✔ Admin account created for ${name} <${email}>. Sign in at /admin.`);
}
