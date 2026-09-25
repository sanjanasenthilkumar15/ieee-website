import { AdminShell } from "@/admin/components/AdminShell";
import { requireUser } from "@/server/auth";
import { STORAGE_IS_TEMPORARY } from "@/server/config";
import { countDocs } from "@/server/db";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const newApplications = countDocs("application", { field: "status", equals: "new" });
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} newApplications={newApplications} temporaryStorage={STORAGE_IS_TEMPORARY}>
      {children}
    </AdminShell>
  );
}
