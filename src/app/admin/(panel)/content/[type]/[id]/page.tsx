import { notFound } from "next/navigation";
import { deleteDocumentAction, saveDocumentAction } from "@/admin/actions";
import { DeleteButton } from "@/admin/components/DeleteButton";
import { DocForm } from "@/admin/components/DocForm";
import { Notice, PageTitle } from "@/admin/components/PageTitle";
import { refOptionsFor } from "@/admin/refs";
import { contentTypeMap } from "@/admin/schema";
import { getDb } from "@/server/db";
import { requireUser } from "@/server/auth";

export default async function EditDoc({ params, searchParams }: PageProps<"/admin/content/[type]/[id]">) {
  await requireUser();
  const { type, id } = await params;
  const { saved } = await searchParams;
  const ct = contentTypeMap[type];
  if (!ct || ct.singletonId) notFound();
  const row = getDb().prepare("SELECT data, updated_at, updated_by FROM documents WHERE id = ? AND type = ?").get(id, type) as
    | { data: string; updated_at: string; updated_by: string | null }
    | undefined;
  if (!row) notFound();
  const data = JSON.parse(row.data) as Record<string, unknown>;
  const title = ct.row(data).title || ct.singular;
  const del = deleteDocumentAction.bind(null, type, id);

  return (
    <>
      <PageTitle
        title={title}
        description={`Last saved ${new Date(row.updated_at.replace(" ", "T") + "Z").toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}${row.updated_by ? ` by ${row.updated_by}` : ""}`}
        back={{ href: `/admin/content/${type}`, label: ct.label }}
        actions={
          <form action={del}>
            <DeleteButton confirmText={`Delete “${title}”? This can’t be undone.`} />
          </form>
        }
      />
      {saved && <Notice>Created. It’s now live on the website.</Notice>}
      <DocForm type={type} id={id} initial={data} refs={refOptionsFor(type)} action={saveDocumentAction} publicUrl={ct.publicUrl?.(data)} />
    </>
  );
}
