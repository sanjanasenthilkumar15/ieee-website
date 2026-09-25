import "server-only";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_DAYS } from "./config";
import { getDb, logActivity } from "./db";

/**
 * Admin authentication: email + password accounts stored in the site's own
 * database. Passwords are hashed with scrypt (never stored in plain text);
 * sessions are random tokens in an HttpOnly cookie, stored hashed.
 */

export type Role = "admin" | "editor";
export type User = { id: string; email: string; name: string; role: Role; lastLoginAt: string | null; createdAt: string };

const COOKIE = "ieee_admin_session";
export const MIN_PASSWORD_LENGTH = 10;

// ---------- passwords ----------

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
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

export function userCount(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
}

export function createUser(input: { email: string; name: string; role: Role; password: string }): User {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO users (id, email, name, role, password_hash) VALUES (?, ?, ?, ?, ?)")
    .run(id, input.email.trim().toLowerCase(), input.name.trim(), input.role, hashPassword(input.password));
  return toUser(getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow);
}

export function setPassword(userId: string, password: string) {
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), userId);
  // Sign out everywhere else after a password change
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function updateUserRole(userId: string, role: Role) {
  getDb().prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
}

export function deleteUser(userId: string) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(userId);
}

export function findUserByEmail(email: string): (User & { passwordHash: string }) | null {
  const r = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as UserRow | undefined;
  return r ? { ...toUser(r), passwordHash: r.password_hash } : null;
}

// ---------- sessions ----------

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

async function isHttps() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? (h.get("origin")?.startsWith("https:") ? "https" : "");
  return proto.split(",")[0].trim() === "https";
}

export async function startSession(user: User) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    sha256(token),
    user.id,
    expires.toISOString().replace("T", " ").slice(0, 19),
  );
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);
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
  if (token) getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  jar.delete(COOKIE);
}

/** The signed-in admin user for this request, or null. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > datetime('now')`,
    )
    .get(sha256(token)) as UserRow | undefined;
  return row ? toUser(row) : null;
});

/** Use at the top of every admin page and server action. */
export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin?denied=1");
  return user;
}
