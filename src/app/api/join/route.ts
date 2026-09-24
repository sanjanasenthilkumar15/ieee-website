import { NextResponse } from "next/server";
import { isSanityConfigured } from "@/sanity/env";
import { writeClient } from "@/sanity/lib/writeClient";
import { validateJoin } from "@/lib/join";

/**
 * POST /api/join — stores a Join Us submission as a `membershipApplication`
 * document in Sanity (status "new"). Office bearers review it in the Studio.
 */
export async function POST(request: Request) {
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

  if (!isSanityConfigured || !process.env.SANITY_API_WRITE_TOKEN) {
    console.warn("[join] Sanity not configured — application not stored:", data.email);
    return NextResponse.json(
      { error: "Online applications aren’t open yet. Please contact the branch by email." },
      { status: 503 },
    );
  }

  try {
    await writeClient.create({
      _type: "membershipApplication",
      status: "new",
      name: data.name,
      department: data.department,
      year: data.year,
      email: data.email,
      phone: data.phone,
      reason: data.reason,
      submittedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[join] Could not save application:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again in a few minutes." }, { status: 500 });
  }
}
