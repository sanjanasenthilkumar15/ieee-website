import { getCurrentUser } from "@/server/auth";
import { listDocs, logActivity } from "@/server/db";
import type { StoredApplication } from "@/lib/content/stored";

/** CSV download of all applications (opens in Excel). Admin login required. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const apps = listDocs<StoredApplication>("application").sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  // Guard against spreadsheet formula injection (cells starting with = + - @)
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = ["Name", "Email", "Phone", "Department", "Year", "Reason", "Submitted (IST)", "Status", "Notes"];
  const lines = apps.map((a) =>
    [a.name, a.email, a.phone, a.department, a.year, a.reason, new Date(a.submittedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), a.status, a.notes ?? ""]
      .map(cell)
      .join(","),
  );
  logActivity(user.email, "exported applications CSV");
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ieee-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
