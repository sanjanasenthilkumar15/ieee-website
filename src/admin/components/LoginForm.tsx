"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input name="email" type="email" autoComplete="username" required autoFocus defaultValue={state?.email ?? ""} key={state?.email ?? "e"} className="mt-1 block w-full rounded-md border border-line px-3 py-2.5 focus:border-ieee-blue focus:ring-2 focus:ring-ieee-blue/20 focus:outline-none" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-ink">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="mt-1 block w-full rounded-md border border-line px-3 py-2.5 focus:border-ieee-blue focus:ring-2 focus:ring-ieee-blue/20 focus:outline-none" />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ieee-blue px-4 py-2.5 font-semibold text-white hover:bg-ieee-blue-dark disabled:opacity-70">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Sign in
      </button>
      <p className="text-xs text-muted">Forgot your password? Ask a branch admin to reset it for you.</p>
    </form>
  );
}
