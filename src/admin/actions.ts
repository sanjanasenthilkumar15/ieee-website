"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createUser,
  deleteUser,
  endSession,
  findUserByEmail,
  getCurrentUser,
  passwordProblem,
  requireUser,
  setPassword,
  startSession,
  updateUserRole,
  verifyPassword,
  type Role,
} from "@/server/auth";
import { deleteDoc, getDoc, getDb, listDocRows, logActivity, saveDoc } from "@/server/db";
import { saveFile, saveImage } from "@/server/media";
import { rateLimit, resetRateLimit } from "@/server/rateLimit";
import { allFields, contentTypeMap } from "./schema";
import { coerce, type Errors } from "./validate";

export type SaveResult = { ok: true; id: string } | { ok: false; errors: Errors; message?: string };

// ---------------------------------------------------------------- content

export async function saveDocumentAction(type: string, id: string | null, form: FormData): Promise<SaveResult> {
  const user = await requireUser();
  const ct = contentTypeMap[type];
  if (!ct) return { ok: false, errors: {}, message: "Unknown content type." };

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(String(form.get("__json") ?? "{}"));
  } catch {
    return { ok: false, errors: {}, message: "Couldn’t read the form. Please try again." };
  }

  const getFile = (key: string) => {
    const f = form.get(`upload:${key}`);
    if (!(f instanceof File) || f.size === 0) throw new Error("A selected file didn’t arrive. Please choose it again.");
    return f;
  };
  const errors: Errors = {};
  const data = await coerce(allFields(ct), raw, { image: (k) => saveImage(getFile(k)), file: (k) => saveFile(getFile(k)) }, errors);

  // Type-specific checks
  if (type === "event" && data.endDate && data.startDate && String(data.endDate) < String(data.startDate)) {
    errors.endDate = "The end must be after the start.";
  }
  for (const key of ct.unique ?? []) {
    const val = data[key];
    if (!val) continue;
    const clash = listDocRows(type).find((r) => r.data[key] === val && r.id !== id);
    if (clash) errors[key] = "Another item already uses this. Please change it slightly.";
  }
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };

  const docId = ct.singletonId ?? id ?? `${type}-${randomUUID().slice(0, 8)}`;
  // Keep fields the form doesn't manage (e.g. timestamps) when editing
  const previous = getDoc<Record<string, unknown>>(docId) ?? {};
  saveDoc(type, docId, { ...stripManaged(previous, ct.type), ...data }, user.email);
  logActivity(user.email, id || ct.singletonId ? "updated" : "created", `${ct.singular}: ${String(data.title ?? data.name ?? docId)}`);
  return { ok: true, id: docId };
}

/** Drop previous values of fields the form manages, so cleared fields stay cleared. */
function stripManaged(prev: Record<string, unknown>, type: string) {
  const managed = new Set(allFields(contentTypeMap[type]).map((f) => f.name));
  return Object.fromEntries(Object.entries(prev).filter(([k]) => !managed.has(k)));
}

export async function deleteDocumentAction(type: string, id: string) {
  const user = await requireUser();
  const ct = contentTypeMap[type];
  if (!ct || ct.singletonId) return;
  const doc = getDoc<Record<string, unknown>>(id);
  deleteDoc(id);
  logActivity(user.email, "deleted", `${ct.singular}: ${String(doc?.title ?? doc?.name ?? id)}`);
  redirect(`/admin/content/${type}?deleted=1`);
}

// ----------------------------------------------------------- applications

export async function updateApplicationAction(id: string, form: FormData) {
  const user = await requireUser();
  const app = getDoc<Record<string, unknown>>(id);
  if (!app || !id.startsWith("application-")) return;
  const status = form.get("status") === "reviewed" ? "reviewed" : "new";
  const notes = String(form.get("notes") ?? "").slice(0, 2000);
  saveDoc("application", id, { ...app, status, notes }, user.email);
  logActivity(user.email, "updated", `Application: ${String(app.name)}`);
}

export async function deleteApplicationAction(id: string) {
  const user = await requireUser();
  const app = getDoc<Record<string, unknown>>(id);
  if (!app || !id.startsWith("application-")) return;
  deleteDoc(id);
  logActivity(user.email, "deleted", `Application: ${String(app.name)}`);
  redirect("/admin/applications?deleted=1");
}

// ------------------------------------------------------------------ auth

export type FormState = { error?: string; success?: string; email?: string } | undefined;

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `login:${ip}:${email}`;
  if (!rateLimit(key, 8, 15 * 60 * 1000)) {
    return { error: "Too many attempts. Please wait 15 minutes and try again.", email };
  }
  const user = email ? findUserByEmail(email) : null;
  // Always run a hash comparison so response time doesn't reveal which emails exist
  const ok = user ? verifyPassword(password, user.passwordHash) : (verifyPassword(password, DUMMY_HASH), false);
  if (!user || !ok) return { error: "Incorrect email or password.", email };
  resetRateLimit(key);
  await startSession(user);
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}
const DUMMY_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==";

export async function logoutAction() {
  const user = await getCurrentUser();
  await endSession();
  if (user) logActivity(user.email, "signed out");
  redirect("/admin/login");
}

export async function changeOwnPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const full = findUserByEmail(user.email);
  if (!full || !verifyPassword(current, full.passwordHash)) return { error: "Your current password is incorrect." };
  if (next !== confirm) return { error: "The new passwords don’t match." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  setPassword(user.id, next);
  await startSession(user); // setPassword signed out all sessions; keep this one
  logActivity(user.email, "changed own password");
  return { success: "Password changed." };
}

// ---------------------------------------------------------------- users

export async function createUserAction(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireUser("admin");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim();
  const role = (form.get("role") === "admin" ? "admin" : "editor") as Role;
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (name.length < 2) return { error: "Enter the person’s name." };
  if (findUserByEmail(email)) return { error: "An account with this email already exists." };
  const problem = passwordProblem(password);
  if (problem) return { error: `Temporary password: ${problem}` };
  createUser({ email, name, role, password });
  logActivity(admin.email, "added user", `${name} <${email}> (${role})`);
  return { success: `Account created for ${name}. Share the temporary password with them privately.` };
}

export async function resetUserPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireUser("admin");
  const userId = String(form.get("userId") ?? "");
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  const target = getDb().prepare("SELECT email FROM users WHERE id = ?").get(userId) as { email: string } | undefined;
  if (!target) return { error: "User not found." };
  setPassword(userId, password);
  logActivity(admin.email, "reset password", target.email);
  return { success: `Password reset for ${target.email}.` };
}

export async function changeRoleAction(form: FormData) {
  const admin = await requireUser("admin");
  const userId = String(form.get("userId") ?? "");
  const role = (form.get("role") === "admin" ? "admin" : "editor") as Role;
  if (userId === admin.id) return; // can't demote yourself
  updateUserRole(userId, role);
  logActivity(admin.email, "changed role", `${userId} → ${role}`);
}

export async function deleteUserAction(form: FormData) {
  const admin = await requireUser("admin");
  const userId = String(form.get("userId") ?? "");
  if (userId === admin.id) return; // can't delete yourself
  const target = getDb().prepare("SELECT email FROM users WHERE id = ?").get(userId) as { email: string } | undefined;
  deleteUser(userId);
  logActivity(admin.email, "removed user", target?.email);
  redirect("/admin/users");
}
