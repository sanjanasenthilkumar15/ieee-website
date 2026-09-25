import Link from "next/link";
import { CalendarPlus, FileText, ImagePlus, Inbox, Star, UserPlus } from "lucide-react";
import { Notice, PageTitle } from "@/admin/components/PageTitle";
import { listTypes } from "@/admin/schema";
import { requireUser } from "@/server/auth";
import { countDocs, listDocs, recentActivity } from "@/server/db";
import type { StoredApplication, StoredEvent } from "@/lib/content/stored";

export const metadata = { title: "Dashboard" };

const fmt = (iso: string) =>
  new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const now = new Date().toISOString();
  const upcoming = listDocs<StoredEvent>("event")
    .filter((e) => (e.endDate ?? e.startDate) >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
  const apps = listDocs<StoredApplication>("application")
    .filter((a) => a.status === "new")
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 5);
  const activity = recentActivity(10);

  const quick = [
    { href: "/admin/content/event/new", label: "Add event", icon: CalendarPlus },
    { href: "/admin/content/galleryAlbum/new", label: "New photo album", icon: ImagePlus },
    { href: "/admin/content/achievement/new", label: "Add achievement", icon: Star },
    { href: "/admin/content/post/new", label: "Write a post", icon: FileText },
    { href: "/admin/content/execomMember/new", label: "Add Execom member", icon: UserPlus },
  ];

  return (
    <>
      <PageTitle title={`Welcome, ${user.name.split(" ")[0]}`} description="Everything you change here is live on the website as soon as you save." />
      {denied && <Notice kind="warn">That page is only for admins.</Notice>}

      <section aria-label="Quick actions" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {quick.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-start gap-2 rounded-lg border border-line bg-white p-4 text-sm font-semibold text-ink hover:border-ieee-blue hover:text-ieee-blue">
            <Icon className="h-5 w-5 text-ieee-blue" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Inbox className="h-5 w-5 text-rmkec-green" aria-hidden="true" /> New applications
            </h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-ieee-blue hover:underline">
              All
            </Link>
          </div>
          {apps.length ? (
            <ul className="divide-y divide-line">
              {apps.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/applications/${a.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-ieee-blue">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{a.name}</span>
                      <span className="text-xs text-muted">
                        {a.department} · Year {a.year}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{fmt(a.submittedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No new applications. Submissions from the Join page appear here.</p>
          )}
        </section>

        <section className="rounded-lg border border-line bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CalendarPlus className="h-5 w-5 text-ieee-blue" aria-hidden="true" /> Upcoming events
            </h2>
            <Link href="/admin/content/event" className="text-sm font-semibold text-ieee-blue hover:underline">
              All
            </Link>
          </div>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/content/event/${e.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-ieee-blue">
                    <span className="truncate font-semibold text-ink">{e.title}</span>
                    <span className="shrink-0 text-xs text-muted">{fmt(e.startDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              Nothing scheduled.{" "}
              <Link href="/admin/content/event/new" className="font-semibold text-ieee-blue hover:underline">
                Add the next event
              </Link>
              .
            </p>
          )}
        </section>

        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">Content</h2>
          <ul className="grid grid-cols-2 gap-2">
            {listTypes.map((t) => (
              <li key={t.type}>
                <Link href={`/admin/content/${t.type}`} className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-sm hover:bg-ieee-blue-light">
                  <span className="font-medium text-ink">{t.label}</span>
                  <span className="font-bold text-ieee-blue tabular-nums">{countDocs(t.type)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">Recent activity</h2>
          {activity.length ? (
            <ul className="space-y-2 text-sm">
              {activity.map((a, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    <span className="font-medium text-ink">{a.user_email ?? "Website"}</span> {a.action}
                    {a.target && <span className="text-muted"> — {a.target}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{fmt(a.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No activity yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
