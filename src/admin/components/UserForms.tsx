"use client";

import { useActionState } from "react";
import { changeOwnPasswordAction, createUserAction, resetUserPasswordAction } from "../actions";

const input = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ieee-blue focus:ring-2 focus:ring-ieee-blue/20 focus:outline-none";
const btn = "rounded-md bg-ieee-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-ieee-blue-dark disabled:opacity-70";

function Result({ state }: { state?: { error?: string; success?: string } }) {
  if (state?.error) return <p role="alert" className="text-sm font-medium text-red-700">{state.error}</p>;
  if (state?.success) return <p role="status" className="text-sm font-medium text-rmkec-green">{state.success}</p>;
  return null;
}

export function AddUserForm() {
  const [state, action, pending] = useActionState(createUserAction, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="text-sm font-semibold">Name</span>
        <input name="name" required className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Email</span>
        <input name="email" type="email" required className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Temporary password</span>
        <input name="password" type="text" minLength={10} required className={input} autoComplete="off" />
        <span className="text-xs text-muted">At least 10 characters. Ask them to change it after signing in.</span>
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Role</span>
        <select name="role" className={input} defaultValue="editor">
          <option value="editor">Editor — manage content & applications</option>
          <option value="admin">Admin — also manage users</option>
        </select>
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button disabled={pending} className={btn}>Add user</button>
        <Result state={state} />
      </div>
    </form>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(resetUserPasswordAction, undefined);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input name="password" type="text" minLength={10} required placeholder="New temporary password" aria-label="New temporary password" className="w-56 rounded-md border border-line px-2.5 py-1.5 text-sm" autoComplete="off" />
      <button disabled={pending} className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:border-ieee-blue">Reset</button>
      <Result state={state} />
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPasswordAction, undefined);
  return (
    <form action={action} className="max-w-sm space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Current password</span>
        <input name="current" type="password" autoComplete="current-password" required className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">New password</span>
        <input name="password" type="password" autoComplete="new-password" minLength={10} required className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Confirm new password</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={10} required className={input} />
      </label>
      <button disabled={pending} className={btn}>Change password</button>
      <Result state={state} />
    </form>
  );
}
