import Link from "next/link";
import { Download } from "lucide-react";
import { Notice, PageTitle } from "@/admin/components/PageTitle";
import { departmentShort } from "@/lib/options";
import type { StoredApplication } from "@/lib/content/stored";
import { listDocs } from "@/server/db";
import { requireUser } from "@/server/auth";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  await requireUser();
  const { status = "new", deleted } = await searchParams;
  const all = listDocs<StoredApplication>("application").sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const counts = { new: all.filter((a) => a.status === "new").length, reviewed: all.filter((a) => a.status === "reviewed").length, all: all.length };
  const shown = status === "all" ? all : all.filter((a) => a.status === status);
  const tabs = [
    ["new", "New"],
    ["reviewed", "Reviewed"],
    ["all", "All"],
  ] as const;

  return (
    <>
      <PageTitle
        title="Membership applications"
        description="Submissions from the Join page. Contact applicants, then mark them reviewed. Only signed-in admins can see these."
        actions={
          <a href="/admin/applications/export" download className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-ieee-blue">
            <Download className="h-4 w-4" aria-hidden="true" /> Download CSV (Excel)
          </a>
        }
      />
      {deleted && <Notice>Application deleted.</Notice>}
      <nav className="mb-5 flex gap-1 border-b border-line" aria-label="Filter">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/applications?status=${key}`}
            aria-current={status === key ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${status === key ? "border-ieee-blue text-ieee-blue" : "border-transparent text-muted hover:text-ink"}`}
          >
            {label} <span className="font-normal">({counts[key]})</span>
          </Link>
        ))}
      </nav>
      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white px-6 py-10 text-center text-muted">No applications here.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((a) => (
                <tr key={a.id} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/admin/applications/${a.id}`} className="font-semibold text-ieee-blue hover:underline">
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {departmentShort[a.department] ?? a.department}, Year {a.year}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${a.email}`} className="block hover:underline">{a.email}</a>
                    <a href={`tel:${a.phone}`} className="text-muted hover:underline">{a.phone}</a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {new Date(a.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${a.status === "new" ? "bg-rmkec-green text-white" : "bg-surface text-muted"}`}>
                      {a.status === "new" ? "New" : "Reviewed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
