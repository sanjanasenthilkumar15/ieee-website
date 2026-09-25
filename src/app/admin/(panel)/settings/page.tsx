import { saveDocumentAction } from "@/admin/actions";
import { DocForm } from "@/admin/components/DocForm";
import { PageTitle } from "@/admin/components/PageTitle";
import { contentTypeMap } from "@/admin/schema";
import { getDoc } from "@/server/db";
import { requireUser } from "@/server/auth";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireUser();
  const ct = contentTypeMap.siteSettings;
  const data = getDoc<Record<string, unknown>>("siteSettings") ?? {};
  return (
    <>
      <PageTitle title="Site settings" description={ct.description} />
      <DocForm type="siteSettings" id="siteSettings" initial={data} refs={{}} action={saveDocumentAction} publicUrl="/" />
    </>
  );
}
