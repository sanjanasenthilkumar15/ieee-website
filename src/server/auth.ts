import "server-only";
import { createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_DAYS } from "./config";
import { getDb, logActivity } from "./db";

/**
 * Admin authentication: email + password accounts stored in the site's own
 * database. Passwords are hashed with scrypt (never stored in plain text);
 * sessions are signed (HMAC) tokens in an HttpOnly cookie, so they stay valid
 * even when several server processes answer requests (e.g. on Vercel).
 */

export type Role = "admin" | "editor";
export type User = { id: string; email: string; name: string; role: Role; lastLoginAt: string | null; createdAt: string };

const COOKIE = "ieee_admin_session";
export const MIN_PASSWORD_LENGTH = 10;

// ---------- passwords ----------

export function hashPassword(password: string, salt: Buffer = randomBytes(16)): string {
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(expected, actual);
}

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (/^(.)\1+$/.test(password)) return "Choose a less predictable password.";
  return null;
}

// ---------- users ----------

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  password_hash: string;
  last_login_at: string | null;
  created_at: string;
};
const toUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  lastLoginAt: r.last_login_at,
  createdAt: r.created_at,
});

export function listUsers(): User[] {
  return (getDb().prepare("SELECT * FROM users ORDER BY role, name").all() as UserRow[]).map(toUser);
}

/**
 * Hosts without a shell (e.g. a Vercel review copy) can't run `npm run admin:create`.
 * If ADMIN_EMAIL and ADMIN_PASSWORD are set and no accounts exist yet, create that
 * admin automatically. Once real accounts exist these variables are ignored.
 */
let envAdminChecked = false;
/** Why ADMIN_EMAIL / ADMIN_PASSWORD didn't create an account (shown on the sign-in page). Never includes the password. */
let envAdminProblem: string | null = null;
export const getEnvAdminProblem = () => envAdminProblem;
function ensureEnvAdmin() {
  if (envAdminChecked) return;
  envAdminChecked = true;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  // Values pasted into hosting dashboards often pick up a stray space or line break
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email && !password) return;
  if (!email) return void (envAdminProblem = "ADMIN_PASSWORD is set but ADMIN_EMAIL is missing or empty.");
  if (!password) return void (envAdminProblem = "ADMIN_EMAIL is set but ADMIN_PASSWORD is missing or empty.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return void (envAdminProblem = "ADMIN_EMAIL isn’t a valid email address.");
  const problem = passwordProblem(password);
  if (problem) return void (envAdminProblem = `ADMIN_PASSWORD is ${password.length} characters. ${problem}`);
  const n = (getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
  if (n > 0) return;
  try {
    // Same salt on every instance → same hash → session cookies work across instances
    const salt = createHash("sha256").update(`env-admin:${email}`).digest().subarray(0, 16);
    createUser({ email, name: process.env.ADMIN_NAME?.trim() || "Admin", role: "admin", password }, salt);
    console.log(`Created admin account ${email} from ADMIN_EMAIL / ADMIN_PASSWORD`);
  } catch (err) {
    envAdminProblem = `Couldn’t create the admin account: ${(err as Error).message}`;
  }
  if (envAdminProblem) console.error(envAdminProblem);
}

export function userCount(): number {
  ensureEnvAdmin();
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
}

export function createUser(input: { email: string; name: string; role: Role; password: string }, salt?: Buffer): User {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO users (id, email, name, role, password_hash) VALUES (?, ?, ?, ?, ?)")
    .run(id, input.email.trim().toLowerCase(), input.name.trim(), input.role, hashPassword(input.password, salt));
  return toUser(getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow);
}

export function setPassword(userId: string, password: string) {
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), userId);
  // Existing session cookies carry a fingerprint of the old hash, so they stop working
}

export function updateUserRole(userId: string, role: Role) {
  getDb().prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
}

export function deleteUser(userId: string) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(userId);
}

export function findUserByEmail(email: string): (User & { passwordHash: string }) | null {
  ensureEnvAdmin();
  const r = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as UserRow | undefined;
  return r ? { ...toUser(r), passwordHash: r.password_hash } : null;
}

// ---------- sessions ----------

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Key for signing session cookies. SESSION_SECRET if set; otherwise, on hosts
 * configured with ADMIN_EMAIL/ADMIN_PASSWORD, derived from those (identical on
 * every instance); otherwise a random key kept in the database.
 */
let secret: Buffer | null = null;
function sessionSecret(): Buffer {
  if (secret) return secret;
  const env = process.env.SESSION_SECRET?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (env) secret = createHash("sha256").update(`session:${env}`).digest();
  else if (email && password) secret = createHash("sha256").update(`session:${email}:${password}`).digest();
  else {
    const db = getDb();
    let row = db.prepare("SELECT value FROM meta WHERE key = 'session_secret'").get() as { value: string } | undefined;
    if (!row) {
      db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('session_secret', ?)").run(randomBytes(32).toString("base64"));
      row = db.prepare("SELECT value FROM meta WHERE key = 'session_secret'").get() as { value: string };
    }
    secret = Buffer.from(row.value, "base64");
  }
  return secret;
}

type SessionPayload = { sid: string; email: string; exp: number; pw: string };
const pwFingerprint = (passwordHash: string) => sha256(passwordHash).slice(0, 16);
const sign = (body: string) => createHmac("sha256", sessionSecret()).update(body).digest("base64url");

function encodeSession(p: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    return typeof p.email === "string" && typeof p.exp === "number" && p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

async function isHttps() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? (h.get("origin")?.startsWith("https:") ? "https" : "");
  return proto.split(",")[0].trim() === "https";
}

export async function startSession(user: User) {
  const full = findUserByEmail(user.email);
  if (!full) return;
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  const token = encodeSession({ sid: randomBytes(12).toString("base64url"), email: full.email, exp: expires.getTime(), pw: pwFingerprint(full.passwordHash) });
  const db = getDb();
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(full.id);
  db.prepare("DELETE FROM revoked_sessions WHERE expires_at < ?").run(Date.now());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await isHttps(),
    path: "/",
    expires,
  });
  logActivity(user.email, "signed in");
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const p = token ? decodeSession(token) : null;
  if (p) getDb().prepare("INSERT OR IGNORE INTO revoked_sessions (sid, expires_at) VALUES (?, ?)").run(p.sid, p.exp);
  jar.delete(COOKIE);
}

/** The signed-in admin user for this request, or null. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  const p = token ? decodeSession(token) : null;
  if (!p) return null;
  if (getDb().prepare("SELECT 1 FROM revoked_sessions WHERE sid = ?").get(p.sid)) return null;
  const user = findUserByEmail(p.email);
  // Deleted user, or password changed since this cookie was issued
  if (!user || pwFingerprint(user.passwordHash) !== p.pw) return null;
  const { passwordHash: _omit, ...rest } = user;
  void _omit;
  return rest;
});

/** Use at the top of every admin page and server action. */
export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin?denied=1");
  return user;
}
