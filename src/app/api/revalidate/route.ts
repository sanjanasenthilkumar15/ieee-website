import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook → instant updates. When an editor publishes, Sanity calls
 * this route with the document type, and pages using that type refresh on
 * their next visit instead of waiting for the ISR timer.
 *
 * Setup (sanity.io/manage → API → Webhooks):
 *   URL:        https://<your-domain>/api/revalidate
 *   Trigger on: Create, Update, Delete
 *   Projection: {_type}
 *   Secret:     same value as SANITY_REVALIDATE_SECRET in Vercel
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, process.env.SANITY_REVALIDATE_SECRET);
    if (!isValidSignature) return new NextResponse("Invalid signature", { status: 401 });
    if (!body?._type) return new NextResponse("Bad request", { status: 400 });
    revalidateTag(body._type, "max");
    return NextResponse.json({ revalidated: body._type, now: Date.now() });
  } catch (err) {
    console.error("[revalidate]", err);
    return new NextResponse("Error", { status: 500 });
  }
}
