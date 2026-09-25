import { PageTitle } from "@/admin/components/PageTitle";
import { ChangePasswordForm } from "@/admin/components/UserForms";
import { requireUser } from "@/server/auth";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageTitle title="Your account" description={`${user.name} · ${user.email} · ${user.role}`} />
      <section className="rounded-lg border border-line bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Change password</h2>
        <ChangePasswordForm />
      </section>
    </>
  );
}
