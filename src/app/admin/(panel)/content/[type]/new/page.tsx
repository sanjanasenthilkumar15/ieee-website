import { notFound } from "next/navigation";
import { saveDocumentAction } from "@/admin/actions";
import { DocForm } from "@/admin/components/DocForm";
import { PageTitle } from "@/admin/components/PageTitle";
import { refOptionsFor } from "@/admin/refs";
import { contentTypeMap } from "@/admin/schema";
import { requireUser } from "@/server/auth";

export default async function NewDoc({ params }: PageProps<"/admin/content/[type]/new">) {
  await requireUser();
  const { type } = await params;
  const ct = contentTypeMap[type];
  if (!ct || ct.singletonId) notFound();
  return (
    <>
      <PageTitle title={`New ${ct.singular.toLowerCase()}`} back={{ href: `/admin/content/${type}`, label: ct.label }} />
      <DocForm type={type} id={null} initial={ct.defaults?.() ?? {}} refs={refOptionsFor(type)} action={saveDocumentAction} />
    </>
  );
}
