import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Notice, PageTitle } from "@/admin/components/PageTitle";
import { contentTypeMap } from "@/admin/schema";
import { listDocRows } from "@/server/db";
import { requireUser } from "@/server/auth";

export default async function ContentList({ params, searchParams }: PageProps<"/admin/content/[type]">) {
  await requireUser();
  const { type } = await params;
  const { deleted, q } = await searchParams;
  const ct = contentTypeMap[type];
  if (!ct || ct.singletonId) notFound();

  const query = typeof q === "string" ? q.trim().toLowerCase() : "";
  let rows = listDocRows(type);
  if (ct.sort) rows = rows.sort((a, b) => ct.sort!(a.data, b.data));
  const items = rows
    .map((r) => ({ id: r.id, ...ct.row(r.data), updatedAt: r.updatedAt, updatedBy: r.updatedBy }))
    .filter((r) => !query || `${r.title} ${r.subtitle ?? ""}`.toLowerCase().includes(query));

  const groups = new Map<string, typeof items>();
  for (const it of items) groups.set(it.group ?? "", [...(groups.get(it.group ?? "") ?? []), it]);

  return (
    <>
      <PageTitle
        title={ct.label}
        description={ct.description}
        actions={
          <Link href={`/admin/content/${type}/new`} className="inline-flex items-center gap-2 rounded-md bg-ieee-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-ieee-blue-dark">
            <Plus className="h-4 w-4" aria-hidden="true" /> New {ct.singular.toLowerCase()}
          </Link>
        }
      />
      {deleted && <Notice>Deleted.</Notice>}

      <form className="mb-5" role="search">
        <input
          name="q"
          defaultValue={query}
          placeholder={`Search ${ct.label.toLowerCase()}…`}
          aria-label={`Search ${ct.label}`}
          className="w-full max-w-sm rounded-md border border-line bg-white px-3 py-2 text-sm focus:border-ieee-blue focus:ring-2 focus:ring-ieee-blue/20 focus:outline-none"
        />
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
          <p className="font-semibold text-ink">{query ? "No matches." : `No ${ct.label.toLowerCase()} yet.`}</p>
          {!query && (
            <Link href={`/admin/content/${type}/new`} className="mt-2 inline-block text-sm font-semibold text-ieee-blue hover:underline">
              Add the first one
            </Link>
          )}
        </div>
      ) : (
        [...groups.entries()].map(([group, list]) => (
          <section key={group} className="mb-8">
            {group && (
              <h2 className="mb-2 text-sm font-bold tracking-wider text-muted uppercase">
                {group} <span className="font-normal">({list.length})</span>
              </h2>
            )}
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
              {list.map((it) => (
                <li key={it.id}>
                  <Link href={`/admin/content/${type}/${it.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-surface">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-surface">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-lg font-bold text-ieee-blue/40">{it.title.slice(0, 1)}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{it.title || "(untitled)"}</span>
                      {it.subtitle && <span className="block truncate text-sm text-muted">{it.subtitle}</span>}
                    </span>
                    {it.badge && <span className="hidden shrink-0 rounded-full bg-ieee-blue-light px-2.5 py-0.5 text-xs font-semibold text-ieee-blue-dark sm:inline">{it.badge}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
