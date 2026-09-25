import { notFound } from "next/navigation";
import { deleteApplicationAction, updateApplicationAction } from "@/admin/actions";
import { DeleteButton } from "@/admin/components/DeleteButton";
import { PageTitle } from "@/admin/components/PageTitle";
import { departments, yearsOfStudy } from "@/lib/options";
import type { StoredApplication } from "@/lib/content/stored";
import { getDoc } from "@/server/db";
import { requireUser } from "@/server/auth";

export default async function ApplicationPage({ params }: PageProps<"/admin/applications/[id]">) {
  await requireUser();
  const { id } = await params;
  const a = id.startsWith("application-") ? getDoc<StoredApplication>(id) : null;
  if (!a) notFound();
  const update = updateApplicationAction.bind(null, id);
  const del = deleteApplicationAction.bind(null, id);
  const rows: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${a.email}`} className="font-semibold text-ieee-blue hover:underline">{a.email}</a>],
    ["Phone", <a key="p" href={`tel:${a.phone}`} className="font-semibold text-ieee-blue hover:underline">{a.phone}</a>],
    ["Department", departments.find((d) => d.value === a.department)?.title ?? a.department],
    ["Year of study", yearsOfStudy.find((y) => y.value === a.year)?.title ?? a.year],
    ["Submitted", new Date(a.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })],
  ];
  return (
    <>
      <PageTitle
        title={a.name}
        back={{ href: "/admin/applications", label: "Applications" }}
        actions={
          <form action={del}>
            <DeleteButton confirmText={`Delete ${a.name}'s application? This can't be undone.`} />
          </form>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-lg border border-line bg-white p-6 lg:col-span-3">
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold tracking-wider text-muted uppercase">{k}</dt>
                <dd className="mt-0.5 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-6 text-xs font-semibold tracking-wider text-muted uppercase">Why they want to join</h2>
          <p className="mt-1 leading-relaxed whitespace-pre-wrap text-ink">{a.reason}</p>
        </section>
        <form action={update} className="h-fit rounded-lg border border-line bg-white p-6 lg:col-span-2">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Status</legend>
            <div className="mt-2 flex gap-2">
              {(["new", "reviewed"] as const).map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm has-[:checked]:border-ieee-blue has-[:checked]:bg-ieee-blue-light">
                  <input type="radio" name="status" value={s} defaultChecked={a.status === s} className="accent-ieee-blue" />
                  {s === "new" ? "New" : "Reviewed"}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">Internal notes</span>
            <textarea name="notes" rows={5} defaultValue={a.notes ?? ""} placeholder="e.g. Called on 3 Oct — will register next week" className="mt-1 block w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ieee-blue focus:ring-2 focus:ring-ieee-blue/20 focus:outline-none" />
          </label>
          <button type="submit" className="mt-4 rounded-md bg-ieee-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-ieee-blue-dark">
            Save
          </button>
        </form>
      </div>
    </>
  );
}
