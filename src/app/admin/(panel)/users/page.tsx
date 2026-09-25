import { changeRoleAction, deleteUserAction } from "@/admin/actions";
import { DeleteButton } from "@/admin/components/DeleteButton";
import { PageTitle } from "@/admin/components/PageTitle";
import { AddUserForm, ResetPasswordForm } from "@/admin/components/UserForms";
import { listUsers, requireUser } from "@/server/auth";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireUser("admin");
  const users = listUsers();
  return (
    <>
      <PageTitle title="Users" description="People who can sign in to this admin panel. Remove office bearers when their term ends." />
      <section className="mb-8 rounded-lg border border-line bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Add a user</h2>
        <AddUserForm />
      </section>
      <ul className="divide-y divide-line rounded-lg border border-line bg-white">
        {users.map((u) => (
          <li key={u.id} className="flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">
                  {u.name} {u.id === me.id && <span className="text-sm font-normal text-muted">(you)</span>}
                </p>
                <p className="text-sm text-muted">
                  {u.email} · last sign-in{" "}
                  {u.lastLoginAt ? new Date(u.lastLoginAt.replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "never"}
                </p>
              </div>
              {u.id !== me.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <form action={changeRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} aria-label={`Role for ${u.name}`} className="rounded-md border border-line px-2 py-1.5 text-sm">
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:border-ieee-blue">Save role</button>
                  </form>
                  <form action={deleteUserAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <DeleteButton label="Remove" confirmText={`Remove ${u.name}'s access?`} />
                  </form>
                </div>
              ) : (
                <span className="rounded-full bg-ieee-blue-light px-3 py-1 text-xs font-bold text-ieee-blue-dark uppercase">{u.role}</span>
              )}
            </div>
            {u.id !== me.id && <ResetPasswordForm userId={u.id} />}
          </li>
        ))}
      </ul>
    </>
  );
}
