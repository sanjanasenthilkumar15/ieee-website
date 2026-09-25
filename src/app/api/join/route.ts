import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { validateJoin } from "@/lib/join";
import { saveDoc } from "@/server/db";
import { rateLimit } from "@/server/rateLimit";

/**
 * POST /api/join — stores a Join Us submission in the site database as an
 * "application" (status "new"). Office bearers review it in /admin.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`join:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data, errors } = validateJoin(body);
  if (!data) return NextResponse.json({ errors }, { status: 422 });

  // Honeypot filled in → almost certainly a bot. Pretend success.
  if (data.website) return NextResponse.json({ ok: true }, { status: 201 });

  try {
    const id = `application-${randomUUID()}`;
    saveDoc("application", id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      year: data.year,
      reason: data.reason,
      submittedAt: new Date().toISOString(),
      status: "new",
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[join] Could not save application:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again in a few minutes." }, { status: 500 });
  }
}
