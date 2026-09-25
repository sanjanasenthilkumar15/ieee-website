import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/admin/components/LoginForm";
import { getCurrentUser, userCount } from "@/server/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getCurrentUser()) redirect("/admin");
  const { next } = await searchParams;
  const noUsers = userCount() === 0;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-4">
          <Image src="/logos/ieee-sb.png" alt="IEEE RMKEC" width={161} height={72} className="h-12 w-auto" priority />
          <Image src="/logos/rmkec-crest.png" alt="" width={331} height={426} className="h-12 w-auto" />
        </div>
        <div className="rounded-xl border border-line bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">IEEE Student Branch, R.M.K. Engineering College</p>
          {noUsers ? (
            <div className="mt-6 rounded-md bg-ieee-blue-light p-4 text-sm text-ieee-blue-dark">
              No admin accounts exist yet. On the server, in the project folder, run:
              <code className="mt-2 block rounded bg-white px-2 py-1 font-mono text-xs">npm run admin:create</code>
              then come back to sign in.
            </div>
          ) : (
            <LoginForm next={typeof next === "string" ? next : ""} />
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-semibold text-ieee-blue hover:underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
