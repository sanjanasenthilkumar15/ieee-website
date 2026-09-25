import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageTitle({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ieee-blue hover:underline">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="mt-1.5 text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Notice({ kind = "ok", children }: { kind?: "ok" | "info" | "warn"; children: React.ReactNode }) {
  const cls = {
    ok: "border-rmkec-green/30 bg-rmkec-green-light text-rmkec-green-dark",
    info: "border-ieee-blue/20 bg-ieee-blue-light text-ieee-blue-dark",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
  }[kind];
  return (
    <p role="status" className={`mb-6 rounded-md border px-4 py-3 text-sm font-medium ${cls}`}>
      {children}
    </p>
  );
}
